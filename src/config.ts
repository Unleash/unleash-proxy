import { CorsOptions } from 'cors';
import { Application } from 'express';
import { Strategy, TagFilter } from 'unleash-client';
import { BootstrapOptions } from 'unleash-client/lib/repository/bootstrap-provider';
import { Logger, LogLevel, SimpleLogger } from './logger';
import { generateInstanceId } from './util';
import { HttpOptions } from 'unleash-client/lib/http-options';

export interface ServerSideSdkConfig {
    tokens: string[];
}
export interface IProxyOption {
    unleashUrl?: string;
    unleashApiToken?: string;
    unleashAppName?: string;
    unleashInstanceId?: string;
    customStrategies?: Strategy[];
    proxySecrets?: string[];
    clientKeys?: string[];
    preHook?: (app: Application) => void;
    proxyBasePath?: string;
    refreshInterval?: number;
    metricsInterval?: number;
    environment?: string;
    projectName?: string;
    logger?: Logger;
    logLevel?: LogLevel;
    trustProxy?: boolean | string | number;
    namePrefix?: string;
    tags?: Array<TagFilter>;
    clientKeysHeaderName?: string;
    enableOAS?: boolean;
    cors?: CorsOptions;
    // experimental options
    expBootstrap?: BootstrapOptions;
    expServerSideSdkConfig?: ServerSideSdkConfig;
    httpOptions?: HttpOptions;
}

export interface IProxyConfig {
    unleashUrl: string;
    unleashApiToken: string;
    unleashAppName: string;
    unleashInstanceId: string;
    customStrategies?: Strategy[];
    clientKeys: string[];
    proxyBasePath: string;
    refreshInterval: number;
    metricsInterval: number;
    environment?: string;
    projectName?: string;
    logger: Logger;
    disableMetrics: boolean;
    trustProxy: boolean | string | number;
    namePrefix?: string;
    tags?: Array<TagFilter>;
    enableOAS: boolean;
    clientKeysHeaderName: string;
    serverSideSdkConfig?: ServerSideSdkConfig;
    bootstrap?: BootstrapOptions;
    cors: CorsOptions;
    httpOptions?: HttpOptions;
}

function resolveStringToArray(value?: string): string[] | undefined {
    if (value) {
        return value.split(/,\s*/);
    }
    return undefined;
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

function safeBoolean(envVar: string | undefined, defaultVal: boolean): boolean {
    if (envVar) {
        return envVar === 'true' || envVar === '1' || envVar === 't';
    }
    return defaultVal;
}

function loadCustomStrategies(path?: string): Strategy[] | undefined {
    if (path) {
        // eslint-disable-next-line
        const strategies = require(path) as Strategy[];
        return strategies;
    }
    return undefined;
}
function removeTrailingPath(path: string): string {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function addLeadingPath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}

export function sanitizeBasePath(path?: string): string {
    if (path === null || path === undefined || path.trim() === '') {
        return '';
    }
    return removeTrailingPath(addLeadingPath(path.trim()));
}

function loadTrustProxy(value: string = 'FALSE') {
    const upperValue = value.toUpperCase();
    if (upperValue === 'FALSE') {
        return false;
    }
    if (upperValue === 'TRUE') {
        return true;
    }
    return value;
}

function mapTagsToFilters(tags?: string): Array<TagFilter> | undefined {
    return resolveStringToArray(tags)?.map((tag) => {
        const [name, value] = tag.split(':');
        return { name, value };
    });
}

function loadClientKeys(option: IProxyOption): string[] | undefined {
    return (
        option.clientKeys ||
        resolveStringToArray(process.env.UNLEASH_PROXY_CLIENT_KEYS) ||
        option.proxySecrets ||
        resolveStringToArray(process.env.UNLEASH_PROXY_SECRETS)
    );
}

function loadServerSideSdkConfig(
    option: IProxyOption,
): ServerSideSdkConfig | undefined {
    if (option.expServerSideSdkConfig) {
        return option.expServerSideSdkConfig;
    }
    const tokens = resolveStringToArray(
        process.env.EXP_SERVER_SIDE_SDK_CONFIG_TOKENS,
    );
    return tokens ? { tokens } : undefined;
}

function loadBootstrapOptions(
    option: IProxyOption,
): BootstrapOptions | undefined {
    if (option.expBootstrap) {
        return option.expBootstrap;
    }
    const bootstrapUrl = process.env.EXP_BOOTSTRAP_URL;
    const expBootstrapAuthorization = process.env.EXP_BOOTSTRAP_AUTHORIZATION;

    const headers = expBootstrapAuthorization
        ? { Authorization: expBootstrapAuthorization }
        : undefined;

    if (bootstrapUrl) {
        return {
            url: bootstrapUrl,
            urlHeaders: headers,
        };
    }
    return undefined;
}

function loadCorsOptions(option: IProxyOption): CorsOptions {
    if (option.cors) {
        return option.cors;
    }

    const computedCorsOptions: CorsOptions = {
        origin: process.env.CORS_ORIGIN || '*',
        maxAge: safeNumber(process.env.CORS_MAX_AGE, 172800),
        exposedHeaders: 'ETag',
    };

    // if cors origin provided contains "," it means it's a list of urls, transform to array
    if (
        typeof computedCorsOptions.origin === 'string' &&
        computedCorsOptions.origin.includes(',')
    ) {
        const transformedOriginList = resolveStringToArray(
            computedCorsOptions.origin,
        );
        if (!transformedOriginList) {
            throw new TypeError(
                `corsOptions.origin (CORS_ORIGIN) unable to transform string to array`,
            );
        }
        computedCorsOptions.origin = transformedOriginList;
    }

    return computedCorsOptions;
}

export function createProxyConfig(option: IProxyOption): IProxyConfig {
    const unleashUrl = option.unleashUrl || process.env.UNLEASH_URL;
    if (!unleashUrl) {
        throw new TypeError(
            'You must specify the unleashUrl option (UNLEASH_URL)',
        );
    }

    const unleashApiToken =
        option.unleashApiToken || process.env.UNLEASH_API_TOKEN;
    if (!unleashApiToken) {
        throw new TypeError(
            'You must specify the unleashApiToken option (UNLEASH_API_TOKEN)',
        );
    }

    const customStrategies =
        option.customStrategies ||
        loadCustomStrategies(process.env.UNLEASH_CUSTOM_STRATEGIES_FILE);

    const clientKeys = loadClientKeys(option);
    if (!clientKeys) {
        throw new TypeError(
            'You must specify the clientKeys option (UNLEASH_PROXY_CLIENT_KEYS)',
        );
    }

    const logLevel = option.logLevel || (process.env.LOG_LEVEL as LogLevel);

    const trustProxy =
        option.trustProxy || loadTrustProxy(process.env.TRUST_PROXY);

    const tags = option.tags || mapTagsToFilters(process.env.UNLEASH_TAGS);

    const unleashInstanceId =
        option.unleashInstanceId ||
        process.env.UNLEASH_INSTANCE_ID ||
        generateInstanceId();

    let proxyBasePath = sanitizeBasePath(
        option.proxyBasePath || process.env.PROXY_BASE_PATH,
    );
    return {
        unleashUrl,
        unleashApiToken,
        unleashAppName:
            option.unleashAppName ||
            process.env.UNLEASH_APP_NAME ||
            'unleash-proxy',
        unleashInstanceId,
        customStrategies,
        clientKeys,
        proxyBasePath,
        refreshInterval:
            option.refreshInterval ||
            safeNumber(process.env.UNLEASH_FETCH_INTERVAL, 5_000),
        metricsInterval:
            option.metricsInterval ||
            safeNumber(process.env.UNLEASH_METRICS_INTERVAL, 30_000),
        environment: option.environment || process.env.UNLEASH_ENVIRONMENT,
        projectName: option.projectName || process.env.UNLEASH_PROJECT_NAME,
        namePrefix: option.namePrefix || process.env.UNLEASH_NAME_PREFIX,
        disableMetrics: false,
        logger: option.logger || new SimpleLogger(logLevel),
        trustProxy,
        tags,
        clientKeysHeaderName:
            option.clientKeysHeaderName ||
            process.env.CLIENT_KEY_HEADER_NAME ||
            'authorization',
        serverSideSdkConfig: loadServerSideSdkConfig(option),
        bootstrap: loadBootstrapOptions(option),
        enableOAS:
            option.enableOAS || safeBoolean(process.env.ENABLE_OAS, false),
        cors: loadCorsOptions(option),
        ...(!!option.httpOptions ? { httpOptions: option.httpOptions } : {}),
    };
}
