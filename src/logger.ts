/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

export enum LogLevel {
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    fatal = 'fatal',
}

const weight = new Map<LogLevel, number>([
    [LogLevel.debug, 0],
    [LogLevel.info, 1],
    [LogLevel.warn, 2],
    [LogLevel.error, 3],
    [LogLevel.fatal, 4],
]);

const resolve = (logLevel: LogLevel) => {
    const w = weight.get(logLevel);
    return w || -1;
};

export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

export class SimpleLogger implements Logger {
    private logLevel: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.warn) {
        this.logLevel = logLevel;
    }

    shouldLog(desired: LogLevel) {
        return resolve(desired) >= resolve(this.logLevel);
    }

    debug(message: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.debug)) {
            console.log(`DEBUG: ${message}`, args);
        }
    }

    info(message: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.info)) {
            console.log(`INFO: ${message}`, args);
        }
    }

    warn(message: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.warn)) {
            console.log(`WARN: ${message}`, args);
        }
    }

    error(message: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.error)) {
            console.log(`ERROR: ${message}`, args);
        }
    }

    fatal(message: any, ...args: any[]): void {
        if (this.shouldLog(LogLevel.fatal)) {
            console.log(`FATAL: ${message}`, args);
        }
    }
}
