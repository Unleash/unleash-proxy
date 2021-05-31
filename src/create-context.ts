/* eslint-disable prefer-object-spread */
import { Request } from 'express';
import { Context } from 'unleash-client';

export function createContext(req: Request<{}, {}, {}, Context>): Context {
    const {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties,
        ...rest
    } = req.query;

    // move non root context fields to properties
    const context: Context = {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress: remoteAddress || req.ip,
        properties: Object.assign({}, rest, properties),
    };

    // Clean undefined properties on the context
    const cleanContext = Object.keys(context)
        .filter((k) => context[k])
        .reduce((a, k) => ({ ...a, [k]: context[k] }), {});

    return cleanContext;
}
