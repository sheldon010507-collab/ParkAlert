const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Add web platform extensions - .web.tsx/.web.ts will be used on web
config.resolver.sourceExts = [
  'web.tsx', 'web.ts', 'web.js',
  ...config.resolver.sourceExts,
]

// Alias react-native-maps to our web stub on web platform
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'src/stubs/MapStub.tsx'),
      type: 'sourceFile',
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
