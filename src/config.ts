export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

class SimpleLogger implements Logger {
    debug(message: any, ...args: any[]): void {
       console.log('INFO: ' + message, args);
    }
    info(message: any, ...args: any[]): void {
        console.log('INFO: ' +message, args);
    }
    warn(message: any, ...args: any[]): void {
        console.log('WARN: ' +message, args);
    }
    error(message: any, ...args: any[]): void {
        console.error('ERROR: ' + message, args);
    }
    fatal(message: any, ...args: any[]): void {
        console.error('FATAL: ' +message, args);
    }

}

export interface IProxyOption {
    unleashUrl?: string;
    unleashApiToken?: string;
    unleashAppName?: string; 
    proxySecrets?: string[];
    proxyPort?: number;
    proxyBasePath?: string;
    refreshInterval?: number,
    metricsInterval?: number,
    environment?: string,
    projectName?: string,
    logger?: Logger
}

export interface IProxyConfig {
    unleashUrl: string;
    unleashApiToken: string;
    unleashAppName: string; 
    proxySecrets: string[];
    proxyBasePath: string;
    refreshInterval: number,
    metricsInterval: number,
    environment?: string,
    projectName?: string,
    logger: Logger
}

function resolveStringToArray(value?: string): string[] | void {
    if(value) {
        return value.split(/,\s*/);
    }
}

function safeNumber(envVar: string | undefined, defaultVal: number): number {
    if (envVar) {
        try {
            return Number.parseInt(envVar, 10);
        } catch (err) {
            return defaultVal;
        }
    } else {
        return defaultVal;
    }
}

export function createProxyConfig(option: IProxyOption): IProxyConfig {
    const unleashUrl = option.unleashUrl || process.env.UNLEASH_URL;
    if(!unleashUrl) {
        throw new TypeError('You must specify the unleashUrl option (UNLEASH_URL)');
    }

    const unleashApiToken = option.unleashApiToken || process.env.UNLEASH_API_TOKEN;
    if(!unleashApiToken) {
        throw new TypeError('You must specify the unleashApiToken option (UNLEASH_API_TOKEN)');
    }

    const proxySecrets = option.proxySecrets || resolveStringToArray(process.env.UNLEASH_PROXY_SECRETS);
    if(! proxySecrets) {
        throw new TypeError('You must specify the unleashProxySecrets option (UNLEASH_PROXY_SECRETS)')
    }

    return {
        unleashUrl,
        unleashApiToken,
        unleashAppName: option.proxyBasePath || process.env.UNLEASH_APP_NANE || 'unleash-proxy',
        proxySecrets,
        proxyBasePath: option.proxyBasePath || process.env.PROXY_BASE_PATH || '', 
        refreshInterval: option.refreshInterval || safeNumber(process.env.UNLEASH_FETCH_INTERVAL, 5_000), 
        metricsInterval: option.metricsInterval || safeNumber(process.env.UNLEASH_METRICS_INTERVAL, 30_000),
        environment: option.environment || process.env.UNLEASH_ENVIRONMENT,
        projectName: option.projectName || process.env.UNLEASH_PROJECT_NAME,
        logger: option.logger || new SimpleLogger(),
    }

}
