import { Unleash, initialize } from 'unleash-client';
import Metrics from 'unleash-client/lib/metrics';
import { defaultStrategies } from 'unleash-client/lib/strategy';
import Client from './client';
import type { IProxyConfig } from './config';

export const createSingletonClient = (config: IProxyConfig): Client => {
    const customHeadersFunction = async () => ({
        Authorization: config.unleashApiToken,
    });

    const unleash = initialize({
        url: config.unleashUrl,
        appName: config.unleashAppName,
        instanceId: config.unleashInstanceId,
        environment: config.environment,
        refreshInterval: config.refreshInterval,
        projectName: config.projectName,
        strategies: config.customStrategies,
        disableMetrics: true,
        namePrefix: config.namePrefix,
        tags: config.tags,
        customHeadersFunction,
        bootstrap: config.bootstrap,
        storageProvider: config.storageProvider,
        ...(config.httpOptions ? { httpOptions: config.httpOptions } : {}),
    });

    const metrics = new Metrics({
        disableMetrics: config.disableMetrics,
        appName: config.unleashAppName,
        instanceId: config.unleashInstanceId,
        strategies: defaultStrategies.map((s) => s.name),
        metricsInterval: config.metricsInterval,
        metricsJitter: config.metricsJitter,
        url: config.unleashUrl,
        customHeadersFunction,
        connectionId: `${config.unleashInstanceId}-${Date.now()}`,
        ...(config.httpOptions ? { httpOptions: config.httpOptions } : {}),
    });

    return new Client(config, unleash, metrics);
};

export const createNewClient = (config: IProxyConfig): Client => {
    const customHeadersFunction = async () => ({
        Authorization: config.unleashApiToken,
    });

    const unleash = new Unleash({
        url: config.unleashUrl,
        appName: config.unleashAppName,
        instanceId: config.unleashInstanceId,
        environment: config.environment,
        refreshInterval: config.refreshInterval,
        projectName: config.projectName,
        strategies: config.customStrategies,
        disableMetrics: true,
        namePrefix: config.namePrefix,
        tags: config.tags,
        customHeadersFunction,
        bootstrap: config.bootstrap,
        storageProvider: config.storageProvider,
        ...(config.httpOptions ? { httpOptions: config.httpOptions } : {}),
    });

    const metrics = new Metrics({
        disableMetrics: config.disableMetrics,
        appName: config.unleashAppName,
        instanceId: config.unleashInstanceId,
        strategies: defaultStrategies.map((s) => s.name),
        metricsInterval: config.metricsInterval,
        metricsJitter: config.metricsJitter,
        url: config.unleashUrl,
        customHeadersFunction,
        connectionId: `${config.unleashInstanceId}-${Date.now()}`,
        ...(config.httpOptions ? { httpOptions: config.httpOptions } : {}),
    });

    return new Client(config, unleash, metrics);
};
