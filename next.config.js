const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

module.exports = {
  reactStrictMode: true,
  future: {
    webpack5: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    const gitRevisionPlugin = new GitRevisionPlugin()
    config.plugins.push(gitRevisionPlugin)
    config.plugins.push(new webpack.DefinePlugin({
      'VERSION': JSON.stringify(gitRevisionPlugin.version()),
      'COMMITHASH': JSON.stringify(gitRevisionPlugin.commithash()),
      'BRANCH': JSON.stringify(gitRevisionPlugin.branch()),
    }))
    return config
  },
}