/* eslint-disable prefer-object-spread */
import { Context } from 'unleash-client';

function tryParseDate(dateString: string | undefined): Date | undefined {
    if (!dateString) {
        return undefined;
    }
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
    } else {
        return undefined;
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createContext(value: any): Context {
    const {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        properties,
        currentTime,
        ...rest
    } = value;

    // move non root context fields to properties
    const context: Context = {
        appName,
        environment,
        userId,
        sessionId,
        remoteAddress,
        currentTime: tryParseDate(currentTime),
        properties: Object.assign({}, rest, properties),
    };

    // Clean undefined properties on the context
    const cleanContext = Object.keys(context)
        .filter((k) => context[k])
        .reduce((a, k) => ({ ...a, [k]: context[k] }), {});

    return cleanContext;
}
