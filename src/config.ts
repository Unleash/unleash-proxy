import { Strategy, TagFilter } from 'unleash-client';
import EventService from './event-service';
import { Logger, LogLevel, SimpleLogger } from './logger';
import { generateInstanceId } from './util';

export interface IProxyOption {
    unleashUrl?: string;
    unleashApiToken?: string;
    unleashAppName?: string;
    unleashInstanceId?: string;
    customStrategies?: Strategy[];
    proxySecrets?: string[];
    proxyPort?: number;
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
}

export interface IProxyConfig {
    unleashUrl: string;
    unleashApiToken: string;
    unleashAppName: string;
    unleashInstanceId: string;
    customStrategies?: Strategy[];
    proxySecrets: string[];
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
    eventService: EventService;
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

function loadCustomStrategies(path?: string): Strategy[] | undefined {
    if (path) {
        // eslint-disable-next-line
        const strategies = require(path) as Strategy[];
        return strategies;
    }
    return undefined;
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

    const proxySecrets =
        option.proxySecrets ||
        resolveStringToArray(process.env.UNLEASH_PROXY_SECRETS);
    if (!proxySecrets) {
        throw new TypeError(
            'You must specify the unleashProxySecrets option (UNLEASH_PROXY_SECRETS)',
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

    const logger = option.logger || new SimpleLogger(logLevel);

    return {
        unleashUrl,
        unleashApiToken,
        unleashAppName:
            option.unleashAppName ||
            process.env.UNLEASH_APP_NAME ||
            'unleash-proxy',
        unleashInstanceId,
        customStrategies,
        proxySecrets,
        proxyBasePath:
            option.proxyBasePath || process.env.PROXY_BASE_PATH || '',
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
        logger,
        trustProxy,
        tags,
        eventService: new EventService(logger),
    };
}
