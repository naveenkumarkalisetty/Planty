// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow .tflite and .gguf model files to be bundled as assets
config.resolver.assetExts.push('tflite', 'gguf');

module.exports = withNativeWind(config, { input: './global.css' });
