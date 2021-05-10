const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

module.exports = {
  reactStrictMode: true,
  future: {
    webpack5: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    const gitRevisionPlugin = new GitRevisionPlugin({
      branch: true,
      versionCommand: "describe --tags --always --dirty | sed -En 's/-dirty/~/p'",
      branchCommand:
        "describe --tags --exact-match 2> /dev/null || git symbolic-ref -q --short HEAD || git rev-parse --short HEAD",
    })
    config.plugins.push(gitRevisionPlugin)
    config.plugins.push(new webpack.DefinePlugin({
      'VERSION': JSON.stringify(gitRevisionPlugin.version()),
      'COMMITHASH': JSON.stringify(gitRevisionPlugin.commithash()),
      'BRANCH': JSON.stringify(gitRevisionPlugin.branch()),
    }))
    return config
  },
}