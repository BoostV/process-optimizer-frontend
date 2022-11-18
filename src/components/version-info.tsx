/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  const showBranch =
    versionInfo.branch !== '' && !/^HEAD$|^main$/.test(versionInfo.branch)
  return (
    <div>
      {versionInfo.version}
      {showBranch && ` [${versionInfo.branch}]`}
    </div>
  )
}
