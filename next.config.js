const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

module.exports = {
  reactStrictMode: true,
  future: {},
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    const gitRevisionPlugin = new GitRevisionPlugin({
      versionCommand: 'describe --tags --always --first-parent',
    })
    config.plugins.push(gitRevisionPlugin)
    config.plugins.push(
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(gitRevisionPlugin.version()),
        COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
        BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      })
    )
    return config
  },
}
