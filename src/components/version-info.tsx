export const versionInfo = {
  version:
    // @ts-ignore
    typeof VERSION !== 'undefined' ? VERSION : '',
  commithash:
    // @ts-ignore
    typeof COMMITHASH !== 'undefined' ? COMMITHASH : '',
  branch:
    // @ts-ignore
    typeof BRANCH !== 'undefined' ? BRANCH : '',
}

export const VersionInfo = () => {
  const showBranch = !/^HEAD$|^main$/.test(versionInfo.branch)
  return (
    <div>
      {versionInfo.version}
      {showBranch && ` [${versionInfo.branch}]`}
    </div>
  )
}
