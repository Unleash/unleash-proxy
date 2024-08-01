import { userInfo, hostname } from 'os';
import type { UserInfo } from 'node:os';

export function generateInstanceId(): string {
    let info: UserInfo<string> | undefined;
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
