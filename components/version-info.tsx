export const versionInfo = {
  version:
    // @ts-ignore
    typeof VERSION !== 'undefined' ? VERSION : '',
  commithasg:
    // @ts-ignore
    typeof COMMITHASH !== 'undefined' ? COMMITHASH : '',
  branch:
    // @ts-ignore
    typeof BRANCH !== 'undefined' ? BRANCH : '',
}

export const VersionInfo = () => {
  return (
    <div>
      {versionInfo.version}
      {/HEAD|main/.test(versionInfo.branch) || ` [${versionInfo.branch}]`}
    </div>
  )
}
