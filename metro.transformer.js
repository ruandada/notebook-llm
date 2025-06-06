const upstreamTransformer = require('@expo/metro-config/babel-transformer')
const JSYaml = require('js-yaml')

module.exports.transform = async ({ src, filename, options }) => {
  // Do something custom for YAML files...
  if (/\.ya?ml$/i.test(filename)) {
    try {
      src = `module.exports=(${JSON.stringify(JSYaml.load(src))})`
    } catch (error) {
      src = `module.exports=(${JSON.stringify(src)})`
    }
  }
  // Pass the source through the upstream Expo transformer.
  return upstreamTransformer.transform({ src, filename, options })
}
