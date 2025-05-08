module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // plugins: [
    //   [
    //     'content-transformer',
    //     {
    //       transformers: [
    //         {
    //           file: /\.ya?ml$/i,
    //           format: 'yaml',
    //         },
    //       ],
    //     },
    //   ],
    // ],
  }
}
