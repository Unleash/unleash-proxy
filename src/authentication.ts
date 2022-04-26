import * as express from 'express';

export function expressAuthentication(
    req: express.Request,
    securityName: string,
    // note: this list will contain the clientKeysHeaderName as item 0 and the
    // list of clientKeys as the rest.
    scopes?: string[],
): Promise<any> {
    if (securityName === 'clientKey' && scopes) {
        const [clientKeysHeaderName, ...clientKeys] = scopes;

        const clientKey = req.header(clientKeysHeaderName);

        if (clientKey && clientKeys.includes(clientKey)) {
            return Promise.resolve();
        } else {
            return Promise.reject();
        }
    }
    return Promise.resolve();
}
