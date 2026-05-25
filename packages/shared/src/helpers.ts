export function envTag(name: string) {
    const isDev = process.env.CDK_APP_DEV;
    let appEnv = isDev ? '-devel' : '-prod';
    return name + appEnv;
}
