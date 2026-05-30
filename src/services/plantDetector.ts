/**
 * plantDetector.ts
 *
 * Encapsulates all TFLite inference logic:
 *   1. Loads the model from android assets at first call
 *   2. Reads a photo file, resizes to 224×224, converts to RGB Float32
 *   3. Runs model.run([inputBuffer]) → output probabilities
 *   4. Returns the top predicted plant label + confidence
 *
 * WHY WE LOAD LABELS FROM A JSON FILE
 * ────────────────────────────────────
 * The TFLite model has labels embedded as ZIP metadata, but
 * `react-native-fast-tflite` doesn't expose metadata parsing.
 * So we extracted labels offline → `src/data/labels.json` and
 * load them at runtime.
 */

import { Image as RNImage } from "react-native";
import { loadTensorflowModel } from "react-native-fast-tflite";
import { loadImage } from "react-native-nitro-image";
import labelsJson from "../data/labels.json";
import { lookupPlant, type PlantInfo } from "../data/plantData";


export interface DetectionResult {
  /** Scientific name straight from the model */
  scientificName: string;
  /** Confidence score 0–1 */
  confidence: number;
  /** Rich info from our DB, or null if plant isn't in our DB */
  plantInfo: PlantInfo | null;
  /** Class index in the label list */
  classIndex: number;
  /** Top 5 predictions if we want to show alternatives */
  topPredictions?: { label: string; confidence: number }[];
}

// ─── Constants ────────────────────────────────────────────────────
/** Model input image size – standard MobileNet */
const INPUT_SIZE = 224;
const MODEL_ASSET = require("../../models/plant_model.tflite");
const CONFIDENCE_THRESHOLD = 0.80; // minimum confidence to report

// ─── Singleton model reference ────────────────────────────────────
let modelPromise: ReturnType<typeof loadTensorflowModel> | null = null;
const labels: string[] = labelsJson as string[];

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Lazily loads the TFLite model (only once).
 */
async function loadModelAsync() {
  console.log("[PlantDetector] Loading model...");
  let modelPath = MODEL_ASSET;

  if (Platform.OS === 'android') {
    const destPath = `${RNFS.DocumentDirectoryPath}/plant_model.tflite`;

    // We force delete and recopy the asset to ensure we don't accidentally load an old cached model
    try {
      const exists = await RNFS.exists(destPath);
      if (exists) {
        await RNFS.unlink(destPath);
      }
    } catch (e) {
      console.log("[PlantDetector] Error clearing old model:", e);
    }

    console.log(`[PlantDetector] Copying model to ${destPath}...`);
    await RNFS.copyFileAssets('plant_model.tflite', destPath);

    // react-native-fast-tflite requires an object with a 'url' property for paths
    return loadTensorflowModel({ url: `file://${destPath}` }, []);
  }

  // For iOS or dev mode where require() works
  return loadTensorflowModel(MODEL_ASSET, []);
}

function getModel() {
  if (!modelPromise) {
    modelPromise = loadModelAsync();
  }
  return modelPromise;
}

/**
 * Pre-warm the model (call once on app start).
 */
export async function warmUpModel(): Promise<void> {
  try {
    await getModel();
    console.log("[PlantDetector] Model loaded successfully");
    console.log("[PlantDetector] Labels count:", labels.length);
  } catch (err) {
    console.error("[PlantDetector] Model load failed:", err);
    modelPromise = null;
    throw err;
  }
}

/**
 * Get the dimensions of an image at the given URI.
 */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err)
    );
  });
}

/**
 * Detect a plant from a photo file path.
 *
 * @param photoPath – absolute filesystem path to the captured JPEG/PNG
 *                    (NOT a file:// URI — we add the prefix ourselves)
 * @returns The top detection result, or null if nothing above threshold
 */
export async function detectPlant(
  photoPath: string
): Promise<DetectionResult | null> {
  const model = await getModel();

  // 1. Read the photo as a pixel buffer using the model's expected input
  //    For MobileNet-style models the input is [1, 224, 224, 3] float32
  //    normalized to [0, 1].
  //
  //    react-native-fast-tflite v3 accepts an ArrayBuffer for each input
  //    tensor. We need to create a 224×224×3 float32 buffer.
  //
  //    Since we can't resize images natively in JS alone without a canvas,
  //    we'll use the model's built-in resize capability:
  //    Many TFLite image models accept any-size input and resize internally,
  //    but for safety we'll prepare a properly-sized buffer.

  // For a simple approach: read the photo file bytes, let the model handle it
  // Actually, with fast-tflite we need to prepare the tensor ourselves.
  // We'll create a simple input buffer with placeholder data based on photo analysis.

  const photoUri = photoPath.startsWith("file://")
    ? photoPath
    : `file://${photoPath}`;

  try {
    // Get image dimensions for logging
    const dims = await getImageSize(photoUri);
    console.log(
      `[PlantDetector] Photo: ${dims.width}×${dims.height}, path: ${photoUri}`
    );

    // Create input tensor: [1, 224, 224, 3] float32
    // We need to read actual pixel data from the image.
    // react-native-fast-tflite expects raw ArrayBuffer input.
    //
    // For the initial implementation, we'll create a buffer from the image data.
    // The model expects float32 RGB values normalized to [0, 1].
    const inputSize = INPUT_SIZE * INPUT_SIZE * 3; // 224 * 224 * 3 = 150528
    const inputBuffer = new Float32Array(inputSize);

    // Use react-native-nitro-image to load, resize, and extract pixels natively
    // We resize natively to 224x224 to avoid looping over millions of pixels in JS
    console.log("[PlantDetector] Loading image via nitro...");
    const image = await loadImage({ filePath: photoPath });

    // 1. Center crop the image to a square to prevent aspect ratio distortion
    const minSize = Math.min(image.width, image.height);
    const startX = (image.width - minSize) / 2;
    const startY = (image.height - minSize) / 2;
    console.log(`[PlantDetector] Cropping ${image.width}x${image.height} to square (${minSize}x${minSize})`);

    const squareImage = await image.cropAsync(startX, startY, startX + minSize, startY + minSize);

    // 2. Resize to the model's expected 224x224
    console.log(`[PlantDetector] Resizing square to ${INPUT_SIZE}x${INPUT_SIZE}...`);
    const resizedImage = await squareImage.resizeAsync(INPUT_SIZE, INPUT_SIZE);

    console.log("[PlantDetector] Getting raw pixel data...");
    const rawData = await resizedImage.toRawPixelDataAsync();
    const pixelFormat = rawData.pixelFormat;
    const pixelBytes = new Uint8Array(rawData.buffer);
    console.log(`[PlantDetector] Pixel format: ${pixelFormat}, size: ${pixelBytes.length}`);

    // Some common formats:
    // ARGB/RGBA/BGRA typically have 4 bytes per pixel.
    // RGB/BGR typically have 3 bytes per pixel.
    const hasAlpha = ['ARGB', 'BGRA', 'ABGR', 'RGBA', 'XRGB', 'BGRX', 'XBGR', 'RGBX'].includes(pixelFormat);
    const bytesPerPixel = hasAlpha ? 4 : 3;

    // We need to map the format to RGB offsets
    let rIdx = 0, gIdx = 1, bIdx = 2;
    if (pixelFormat === 'BGRA' || pixelFormat === 'BGRX' || pixelFormat === 'BGR') {
      bIdx = 0; gIdx = 1; rIdx = 2;
    } else if (pixelFormat === 'ARGB' || pixelFormat === 'ABGR') {
      // Alpha is first, skip it
      rIdx = 1; gIdx = 2; bIdx = 3;
      if (pixelFormat === 'ABGR') {
        bIdx = 1; gIdx = 2; rIdx = 3;
      }
    } else if (pixelFormat === 'RGBA' || pixelFormat === 'RGBX' || pixelFormat === 'RGB') {
      rIdx = 0; gIdx = 1; bIdx = 2;
    }

    // For models that accept uint8 input, create a uint8 buffer
    const uint8Input = new Uint8Array(inputSize);

    // Extract actual RGB pixels
    let dstIdx = 0;
    for (let i = 0; i < pixelBytes.length; i += bytesPerPixel) {
      if (dstIdx >= inputSize) break;

      const r = pixelBytes[i + rIdx];
      const g = pixelBytes[i + gIdx];
      const b = pixelBytes[i + bIdx];

      // Float32 format: normalized to [0, 1]
      inputBuffer[dstIdx] = r / 255.0;
      inputBuffer[dstIdx + 1] = g / 255.0;
      inputBuffer[dstIdx + 2] = b / 255.0;

      // Uint8 format: [0-255]
      uint8Input[dstIdx] = r;
      uint8Input[dstIdx + 1] = g;
      uint8Input[dstIdx + 2] = b;

      dstIdx += 3;
    }

    // DEBUG: Log the first and center pixel values to verify they aren't zero/garbage
    console.log(`[PlantDetector] Pixel[0] (top-left): R=${uint8Input[0]}, G=${uint8Input[1]}, B=${uint8Input[2]}`);
    const centerIdx = (112 * 224 + 112) * 3;
    console.log(`[PlantDetector] Pixel[Center]: R=${uint8Input[centerIdx]}, G=${uint8Input[centerIdx + 1]}, B=${uint8Input[centerIdx + 2]}`);

    // 2. Run inference
    console.log("[PlantDetector] Running inference...");
    const startTime = Date.now();

    // Try with the appropriate input format based on model spec
    let outputs: ArrayBuffer[];
    const inputType = model.inputs[0]?.dataType;
    console.log(`[PlantDetector] Model expects input type: ${inputType}`);

    try {
      if (inputType === 'uint8') {
        outputs = model.runSync([uint8Input.buffer as ArrayBuffer]);
      } else {
        // Most Google models expect float32 input normalized [0,1]
        outputs = model.runSync([inputBuffer.buffer as ArrayBuffer]);
      }
    } catch (e) {
      console.error("[PlantDetector] Inference failed:", e);
      throw e;
    }

    const inferenceTime = Date.now() - startTime;
    console.log(`[PlantDetector] Inference done in ${inferenceTime}ms`);

    // 3. Parse output probabilities
    const outputBuffer = outputs[0];
    let outputData: Float32Array | Uint8Array;
    let isQuantizedOutput = false;

    // Determine if output is float32 or uint8 by checking its length
    // Float32 array buffer length will be evenly divisible by 4.
    // If it equals the number of labels precisely, it's uint8.
    if (outputBuffer.byteLength === labels.length * 4) {
      outputData = new Float32Array(outputBuffer);
    } else if (outputBuffer.byteLength === labels.length) {
      outputData = new Uint8Array(outputBuffer);
      isQuantizedOutput = true;
    } else {
      // Fallback: try Float32 first if divisible by 4, else Uint8
      if (outputBuffer.byteLength % 4 === 0) {
        outputData = new Float32Array(outputBuffer);
      } else {
        outputData = new Uint8Array(outputBuffer);
        isQuantizedOutput = true;
      }
    }

    console.log(`[PlantDetector] Output tensor size: ${outputData.length}, isQuantized: ${isQuantizedOutput}`);

    // Find top prediction (argmax)
    let maxIdx = 0;
    let maxVal = -1;
    for (let i = 0; i < outputData.length; i++) {
      let val = outputData[i];
      if (isQuantizedOutput) val = val / 255.0;

      if (val > maxVal) {
        maxVal = val;
        maxIdx = i;
      }
    }

    console.log(
      `[PlantDetector] Top prediction: idx=${maxIdx}, confidence=${maxVal.toFixed(4)}, label="${labels[maxIdx] || "unknown"}"`
    );

    // Log top 5 predictions for debugging and return them
    const indices = Array.from({ length: outputData.length }, (_, i) => i);
    indices.sort((a, b) => {
      let valA = outputData[a];
      let valB = outputData[b];
      if (isQuantizedOutput) {
        valA /= 255.0;
        valB /= 255.0;
      }
      return valB - valA;
    });

    console.log("[PlantDetector] Top 5 predictions:");
    const topPredictions: { label: string; confidence: number }[] = [];
    for (let i = 0; i < Math.min(5, indices.length); i++) {
      const idx = indices[i];
      let val = outputData[idx];
      if (isQuantizedOutput) val /= 255.0;

      const labelName = labels[idx] || `class_${idx}`;
      console.log(`  ${i + 1}. ${labelName}: ${(val * 100).toFixed(2)}%`);

      topPredictions.push({
        label: labelName,
        confidence: val
      });
    }

    if (maxVal < CONFIDENCE_THRESHOLD) {
      console.log("[PlantDetector] Below confidence threshold, returning 'Unknown' with top predictions");
      return {
        scientificName: "Unknown",
        confidence: maxVal,
        plantInfo: null,
        classIndex: -1,
        topPredictions,
      };
    }

    const scientificName = labels[maxIdx] || `Unknown (class ${maxIdx})`;
    const plantInfo = lookupPlant(scientificName);

    return {
      scientificName,
      confidence: maxVal,
      plantInfo,
      classIndex: maxIdx,
      topPredictions,
    };
  } catch (error) {
    console.error("[PlantDetector] Detection error:", error);
    throw error;
  }
}
