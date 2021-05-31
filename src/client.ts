import EventEmitter from 'events';
import { Context, getFeatureToggleDefinitions, getVariant, initialize, isEnabled, Unleash } from 'unleash-client';
import Metrics from 'unleash-client/lib/metrics';
import { defaultStrategies } from 'unleash-client/lib/strategy';
import { IProxyConfig, Logger } from './config';
import { generateInstanceId } from './util';

export interface IEnabledToggles {

}

export interface IMetrics {

}

export interface IClient extends EventEmitter {
    setUnleashApiToken: (unleashApiToken: string) => void;
    getEnabledToggles: (context: Context) => IEnabledToggles;
    getDefinedToggles: (toggleNames: string[], context: Context) => IEnabledToggles;
    registerMetrics(metrics: any): void
}

class Client extends EventEmitter implements IClient {

    private unleashApiToken: string;
    private unleashInstance: Unleash;
    private metrics: Metrics;
    private logger: Logger;

    constructor(config: IProxyConfig) {
        super();
        this.unleashApiToken = config.unleashApiToken;
        this.logger = config.logger;

        const instanceId = generateInstanceId();
        const customHeadersFunction = async () => ({ Authorization: this.unleashApiToken })

        // Unleash Client instance.
        this.unleashInstance = initialize({
            url: config.unleashUrl,
            appName: config.unleashAppName,
            instanceId,
            environment: config.environment,
            refreshInterval: config.refreshInterval,
            projectName: config.projectName,
            disableMetrics: true,
            customHeadersFunction,
        });


        // Custom metrics Instance
        this.metrics = new Metrics({
            disableMetrics: false,
            appName: config.unleashAppName,
            instanceId,
            strategies: defaultStrategies.map(s => s.name),
            metricsInterval: config.metricsInterval,
            url: config.unleashUrl,
            customHeadersFunction,
        });

        this.metrics.on('error', msg => this.logger.error(`metrics: ${msg}`));
        this.unleashInstance.on('error', msg => this.logger.error(msg));
        this.unleashInstance.on('ready', () => this.emit('ready'));
    }

    setUnleashApiToken(unleashApiToken: string): void {
        this.unleashApiToken = unleashApiToken;
    }

    getEnabledToggles(context: Context) {
        const definitions = getFeatureToggleDefinitions() || [];
        return definitions
            .filter((d) => isEnabled(d.name, context))
            .map((d) => ({
                name: d.name,
                enabled: true,
                variant: getVariant(d.name, context),
            }));
    }

    getDefinedToggles(toggleNames: string[], context: Context) {
        return toggleNames.map(name => {
            const enabled = isEnabled(name, context);
            this.metrics.count(name, enabled);
            return {
                name,
                enabled,
                variant: getVariant(name, context),
            }
        });
    }

    /*
    * A very simplistic implementation which support counts. 
    * In future we must consider to look at start/stop times
    * and adjust counting thereafter. 
    */
    registerMetrics(metrics: any) {
        const toggles = metrics.bucket.toggles;

        Object.keys(toggles).forEach(toggleName => {
            const yesCount = toggles[toggleName].yes;
            const noCount = toggles[toggleName].no;
            [...Array(yesCount)].forEach(() => this.metrics.count(toggleName, true));
            [...Array(noCount)].forEach(() => this.metrics.count(toggleName, false));
        });
    }
};

export default Client;