const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const createConfig = () => {
  const config = getDefaultConfig(__dirname)

  const { resolver } = config

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('./metro.transformer'),
  }

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(
      (ext) => ext !== 'yaml' && ext !== 'yml'
    ),
    sourceExts: [...resolver.sourceExts, 'yaml', 'yml'],
  }

  return config
}

module.exports = withNativeWind(createConfig(), {
  input: './assets/global.css',
})
