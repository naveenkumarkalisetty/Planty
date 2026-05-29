import { initLlama, LlamaContext, RNLlamaOAICompatibleMessage } from 'llama.rn';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

let llamaContext: LlamaContext | null = null;

export async function initializeLLM() {
  if (llamaContext) return llamaContext;

  console.log("[LLM] Initializing SmolLM2...");
  try {
    let modelPath = 'SmolLM2-135M-Instruct-Q4_K_M.gguf';

    // On Android, we must copy the asset to the filesystem so the C++ engine can load it
    if (Platform.OS === 'android') {
      const destPath = `${RNFS.DocumentDirectoryPath}/${modelPath}`;
      const exists = await RNFS.exists(destPath);
      if (!exists) {
        console.log(`[LLM] Copying model to ${destPath}...`);
        await RNFS.copyFileAssets(modelPath, destPath);
        console.log("[LLM] Model copied successfully.");
      }
      modelPath = destPath;
    }

    llamaContext = await initLlama({
      model: modelPath,
      is_model_asset: Platform.OS === 'ios',
      n_ctx: 2048, // generous context window for chat history
    });
    console.log("[LLM] Initialized successfully.");
    return llamaContext;
  } catch (err) {
    console.error("[LLM] Initialization failed:", err);
    throw err;
  }
}

export async function generateChatResponse(
  messages: RNLlamaOAICompatibleMessage[],
  onToken: (tokenText: string) => void
) {
  const context = await initializeLLM();

  return new Promise<string>(async (resolve, reject) => {
    let fullResponse = "";

    try {
      // SmolLM2 uses ChatML. If the GGUF lacks the embedded template, it acts like a base model.
      // We manually construct the ChatML prompt here to guarantee it works.
      let chatMLPrompt = "";
      for (const msg of messages) {
        chatMLPrompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`;
      }
      chatMLPrompt += `<|im_start|>assistant\n`;

      console.log("[LLM] Starting completion...");
      const result = await context.completion(
        {
          prompt: chatMLPrompt,
          temperature: 0.7,
          top_p: 0.9,
          n_predict: 300,
          stop: ["<|im_end|>", "<|im_start|>"],
        },
        (data) => {
          if (data.token) {
            fullResponse += data.token;
            onToken(data.token);
          }
        }
      );

      console.log("[LLM] Completion finished.");
      resolve(result.text || fullResponse);
    } catch (err) {
      console.error("[LLM] Generation failed:", err);
      reject(err);
    }
  });
}
