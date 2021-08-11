import EventEmitter from 'events';
import { Context, initialize, Unleash, Variant } from 'unleash-client';
import Metrics from 'unleash-client/lib/metrics';
import { defaultStrategies } from 'unleash-client/lib/strategy';
import { TagFilter } from 'unleash-client/lib/tags';
import { IProxyConfig } from './config';
import { Logger } from './logger';

export type FeatureToggleStatus = {
    name: string;
    enabled: boolean;
    variant?: Variant;
};

interface VariantBucket {
    [s: string]: number;
}

interface Bucket {
    start: Date;
    stop: Date | null;
    toggles: {
        [s: string]: { yes: number; no: number; variants?: VariantBucket };
    };
}

export interface IMetrics {
    bucket: Bucket;
}

export interface IClient extends EventEmitter {
    setUnleashApiToken: (unleashApiToken: string) => void;
    getEnabledToggles: (context: Context) => FeatureToggleStatus[];
    getDefinedToggles: (
        toggleNames: string[],
        context: Context,
    ) => FeatureToggleStatus[];
    registerMetrics(metrics: any): void;
    isReady(): boolean;
}

class Client extends EventEmitter implements IClient {
    unleash: Unleash;

    private unleashApiToken: string;

    private environment?: string;

    private readonly namePrefix?: string;

    private readonly tags?: Array<TagFilter>;

    private metrics: Metrics;

    private logger: Logger;

    private ready: boolean = false;

    constructor(config: IProxyConfig, init: Function = initialize) {
        super();
        this.unleashApiToken = config.unleashApiToken;
        this.environment = config.environment;
        this.namePrefix = config.namePrefix;
        this.tags = config.tags;
        this.logger = config.logger;

        const customHeadersFunction = async () => ({
            Authorization: this.unleashApiToken,
        });

        // Unleash Client instance.
        this.unleash = init({
            url: config.unleashUrl,
            appName: config.unleashAppName,
            instanceId: config.unleashInstanceId,
            environment: this.environment,
            refreshInterval: config.refreshInterval,
            projectName: config.projectName,
            strategies: config.customStrategies,
            disableMetrics: true,
            namePrefix: this.namePrefix,
            tags: this.tags,
            customHeadersFunction,
        });

        // Custom metrics Instance
        this.metrics = new Metrics({
            disableMetrics: config.disableMetrics,
            appName: config.unleashAppName,
            instanceId: config.unleashInstanceId,
            strategies: defaultStrategies.map((s) => s.name),
            metricsInterval: config.metricsInterval,
            url: config.unleashUrl,
            customHeadersFunction,
        });

        this.metrics.on('error', (msg) => this.logger.error(`metrics: ${msg}`));
        this.unleash.on('error', (msg) => this.logger.error(msg));
        this.unleash.on('ready', () => {
            this.emit('ready');
            this.ready = true;
        });
    }

    setUnleashApiToken(unleashApiToken: string): void {
        this.unleashApiToken = unleashApiToken;
    }

    fixContext(context: Context): Context {
        const { environment } = this;
        if (environment) {
            return { ...context, environment };
        }
        return context;
    }

    getEnabledToggles(inContext: Context): FeatureToggleStatus[] {
        this.logger.info(
            'Get enabled feature toggles for provided context',
            inContext,
        );
        const context = this.fixContext(inContext);

        const definitions = this.unleash.getFeatureToggleDefinitions() || [];
        return definitions
            .filter((d) => this.unleash.isEnabled(d.name, context))
            .map((d) => ({
                name: d.name,
                enabled: true,
                variant: this.unleash.getVariant(d.name, context),
            }));
    }

    getDefinedToggles(
        toggleNames: string[],
        inContext: Context,
    ): FeatureToggleStatus[] {
        const context = this.fixContext(inContext);
        return toggleNames.map((name) => {
            const enabled = this.unleash.isEnabled(name, context);
            this.metrics.count(name, enabled);
            return {
                name,
                enabled,
                variant: this.unleash.getVariant(name, context),
            };
        });
    }

    /*
     * A very simplistic implementation which support counts.
     * In future we must consider to look at start/stop times
     * and adjust counting thereafter.
     */
    registerMetrics(metrics: IMetrics): void {
        const { toggles } = metrics.bucket;

        Object.keys(toggles).forEach((toggleName) => {
            const yesCount = toggles[toggleName].yes;
            const noCount = toggles[toggleName].no;
            [...Array(yesCount)].forEach(() =>
                this.metrics.count(toggleName, true),
            );
            [...Array(noCount)].forEach(() =>
                this.metrics.count(toggleName, false),
            );
        });
    }

    destroy(): void {
        this.unleash.destroy();
    }

    isReady(): boolean {
        return this.ready;
    }
}

export default Client;
