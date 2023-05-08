import EventEmitter from 'events';
import { Context, initialize, Unleash, Variant } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import Metrics from 'unleash-client/lib/metrics';
import { defaultStrategies } from 'unleash-client/lib/strategy';
import { getDefaultVariant } from 'unleash-client/lib/variant';
import { IProxyConfig } from './config';
import { Logger } from './logger';

export type FeatureToggleStatus = {
    name: string;
    enabled: boolean;
    impressionData: boolean;
    variant?: Variant;
};

interface VariantBucket {
    [s: string]: number;
}

interface Bucket {
    toggles: {
        [s: string]: {
            yes?: number;
            no?: number;
            variants?: VariantBucket;
        };
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

    getAllToggles: (context: Context) => FeatureToggleStatus[];

    getFeatureToggleDefinitions(): FeatureInterface[];

    registerMetrics(metrics: IMetrics): void;

    isReady(): boolean;
}

class Client extends EventEmitter implements IClient {
    unleash: Unleash;

    private unleashApiToken: string;

    private environment?: string;

    private metrics: Metrics;

    private logger: Logger;

    private ready: boolean = false;

    constructor(config: IProxyConfig, init: Function = initialize) {
        super();
        this.unleashApiToken = config.unleashApiToken;
        this.environment = config.environment;
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
            namePrefix: config.namePrefix,
            tags: config.tags,
            customHeadersFunction,
            bootstrap: config.bootstrap,
            storageProvider: config.storageProvider,
            ...(!!config.httpOptions
                ? { httpOptions: config.httpOptions }
                : {}),
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
            ...(!!config.httpOptions
                ? { httpOptions: config.httpOptions }
                : {}),
        });

        this.metrics.on('error', (msg) => this.logger.error(`metrics: ${msg}`));
        this.unleash.on('error', (msg) => this.logger.error(msg));
        this.unleash.on('ready', () => {
            this.emit('ready');
            this.ready = true;
            this.metrics.start();
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

    getAllToggles(inContext: Context): FeatureToggleStatus[] {
        this.logger.info(
            'Get all feature toggles for provided context',
            inContext,
        );
        const context = this.fixContext(inContext);

        const definitions = this.unleash.getFeatureToggleDefinitions() || [];
        return definitions.map((d) => {
            const enabled = this.unleash.isEnabled(d.name, context);
            const variant = enabled
                ? this.unleash.forceGetVariant(d.name, context)
                : getDefaultVariant();

            return {
                name: d.name,
                enabled: enabled,
                variant: variant,
                impressionData: d.impressionData,
            };
        });
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
                variant: this.unleash.forceGetVariant(d.name, context),
                impressionData: d.impressionData,
            }));
    }

    getDefinedToggles(
        toggleNames: string[],
        inContext: Context,
    ): FeatureToggleStatus[] {
        const context = this.fixContext(inContext);
        return toggleNames.map((name) => {
            const definition = this.unleash.getFeatureToggleDefinition(name);
            const enabled = this.unleash.isEnabled(name, context);
            this.metrics.count(name, enabled);
            return {
                name,
                enabled,
                variant: this.unleash.getVariant(name, context),
                impressionData: definition?.impressionData ?? false,
            };
        });
    }

    getFeatureToggleDefinitions(): FeatureInterface[] {
        return this.unleash.getFeatureToggleDefinitions();
    }

    /*
     * A very simplistic implementation which support counts.
     * In future we must consider to look at start/stop times
     * and adjust counting thereafter.
     */
    registerMetrics(metrics: IMetrics): void {
        const { toggles } = metrics.bucket;

        Object.keys(toggles).forEach((toggleName) => {
            const toggle = toggles[toggleName];
            const yesCount: number = toggle.yes ?? 0;
            const noCount: number = toggle.no ?? 0;
            [...Array(yesCount)].forEach(() =>
                this.metrics.count(toggleName, true),
            );
            [...Array(noCount)].forEach(() =>
                this.metrics.count(toggleName, false),
            );
            const variants = toggle.variants;
            if (variants) {
                Object.entries(variants).forEach(
                    ([variantName, variantCount]) => {
                        [...Array(variantCount)].forEach(() =>
                            this.metrics.countVariant(toggleName, variantName),
                        );
                    },
                );
            }
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
