import type { UserInfo } from 'node:os';
import { hostname, userInfo } from 'node:os';

export function generateInstanceId(): string {
    let info: UserInfo<string> | undefined;
    try {
        info = userInfo();
    } catch (_e) {
        // unable to read info;
    }

    const prefix = info
        ? info.username
        : `generated-${Math.round(Math.random() * 1000000)}-${process.pid}`;
    return `${prefix}-${hostname()}`;
}
