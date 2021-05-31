import { userInfo, hostname } from 'os';

export function generateInstanceId(): string {
    let info;
    try {
        info = userInfo();
    } catch (e) {
        // unable to read info;
    }

    const prefix = info
        ? info.username
        : `generated-${Math.round(Math.random() * 1000000)}-${process.pid}`;
    return `${prefix}-${hostname()}`;
}
