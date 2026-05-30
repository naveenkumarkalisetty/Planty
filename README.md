# Planty - AI Plant Identifier & Assistant

Planty is a cutting-edge React Native application built with Expo that runs powerful Artificial Intelligence models **100% locally on-device**. It allows users to point their camera at a plant, instantly identify it using computer vision, and receive detailed care instructions and medicinal benefits from a local Large Language Model (LLM)—all without needing an internet connection.

---

## Technologies Used

### Core Framework
* **React Native / Expo (SDK 56):** The core framework powering the cross-platform application.
* **Expo Router:** File-based routing for seamless navigation.
* **NativeWind (v4):** Tailwind CSS for React Native, providing a sleek, modern, and responsive UI design.

### Camera & Image Processing
* **`react-native-vision-camera` (v5):** High-performance native camera integration for capturing plant photos.
* **`react-native-nitro-image`:** A blazing-fast C++ powered image manipulation library used to crop, resize, and extract raw RGB pixel data from the camera frames.

### On-Device Artificial Intelligence
* **`react-native-fast-tflite` (v3):** Nitro-powered TensorFlow Lite engine. Used to run the visual plant classification model (MobileNet).
* **`llama.rn`:** A React Native binding for `llama.cpp`. Used to run a quantized local LLM directly on the device's CPU/GPU.
* **SmolLM2 (135M Instruct):** The highly efficient, quantized `.gguf` language model that acts as the "Planty" chat assistant.

---

## The AI Model Flow

The magic of Planty happens in a fluid, multi-step pipeline that transitions seamlessly from the camera hardware to the UI.

### 1. Capture & Pre-Processing
When the user taps the shutter button, `react-native-vision-camera` captures a high-resolution photo. This photo is immediately passed to `react-native-nitro-image`, which natively crops the image to a perfect square and resizes it to **224x224 pixels** (the exact input size required by the TFLite model). It then extracts the raw RGB pixel data, bypassing slow Javascript bridges.

### 2. Vision Classification
The raw Float32 pixel buffer is fed directly into the local TensorFlow Lite model via `react-native-fast-tflite`. The model analyzes the image and outputs a confidence score along with the plant's scientific name (e.g., *Ocimum tenuiflorum*).

### 3. Data Retrieval & Prompting
Planty checks a local database for hardcoded Ayurvedic benefits. If the plant isn't in the database, the app dynamically constructs a **ChatML** formatted prompt, injecting the detected scientific name:
> *"Tell me the benefits of plant [Scientific Name]."*

*(Edge case handling: If the scanner detects 'none' or 'background', the prompt is dynamically altered to instruct the AI to politely inform the user that no plant was found).*

### 4. LLM Generation
The prompt is passed to `llama.rn`, which spins up the local **SmolLM2-135M** model. As the model generates text token-by-token in C++, the response is asynchronously streamed back to the React Native UI, creating a fast, ChatGPT-like typing effect right on the scanner card!

---

## ⚙️ Engineering Highlights

* **Android Asset Extraction:** Because Android compresses assets inside the APK during production (EAS builds), native C++ engines (like `llama.cpp` and `fast-tflite`) cannot memory-map the model files. Planty solves this by using `react-native-fs` to seamlessly extract the `.gguf` and `.tflite` files to the local Document Directory on first load, ensuring lightning-fast native execution.
* **Asynchronous Streaming:** The LLM generation runs completely asynchronously without blocking the main React Native thread, allowing smooth slide-up animations and pulsing loading indicators while the AI thinks.
## Setup & Local Installation

To keep the repository lightweight and avoid GitHub's file size limits, the AI models are ignored in this repository. To run this project locally, you must manually download them.

### 1. Download the AI Models
1. Create a folder named `models/` in the root of the project.
2. Download the local LLM (**SmolLM2-135M-Instruct-Q4_K_M**) from Hugging Face:
   * [smollm2-135m-instruct-q4_k_m.gguf](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct-GGUF/resolve/main/smollm2-135m-instruct-q4_k_m.gguf)
3. Download the Ayurvedic Computer Vision classification model (**plant_model.tflite**):
   * [plant_model.tflite (Medicinal Plants)](https://raw.githubusercontent.com/Sandeepmopidevi/Medicinal-Plants-Detection-Using-Machine-Learning/main/model.tflite)
4. Place both downloaded files (`.gguf` and `.tflite`) inside the `models/` directory.

### 2. How the Models are Loaded (Expo Config)
To ensure the native C++ engines can read these AI models efficiently on Android, we wrote a custom Expo plugin (`plugins/withPlantAssets.js`) which handles two critical steps during the `prebuild` phase:
* **Asset Copying:** It automatically copies the `.gguf` and `.tflite` files from the `models/` directory directly into `android/app/src/main/assets/`.
* **noCompress Configuration:** It modifies `app/build.gradle` to set `aaptOptions { noCompress 'gguf', 'tflite' }`. This prevents Android from zipping the model files into the APK. Because the models remain uncompressed, `llama.rn` and `react-native-fast-tflite` can execute them incredibly fast without having to unpack them into memory first!
