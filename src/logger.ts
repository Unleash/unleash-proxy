/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

export class SimpleLogger implements Logger {
    debug(message: any, ...args: any[]): void {
        console.log(`INFO: ${message}`, args);
    }

    info(message: any, ...args: any[]): void {
        console.log(`INFO: ${message}`, args);
    }

    warn(message: any, ...args: any[]): void {
        console.log(`WARN: ${message}`, args);
    }

    error(message: any, ...args: any[]): void {
        console.error(`ERROR: ${message}`, args);
    }

    fatal(message: any, ...args: any[]): void {
        console.error(`FATAL: ${message}`, args);
    }
}
