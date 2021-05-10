export const versionInfo = {
    version: 
    // @ts-ignore
    VERSION,
    commithasg: 
    // @ts-ignore
    COMMITHASH,
    branch: 
    // @ts-ignore
    BRANCH
}

export const VersionInfo = () => {
    return <div>{versionInfo.version}{versionInfo.branch !== 'main' && ` [${versionInfo.branch}]`}
</div>
}