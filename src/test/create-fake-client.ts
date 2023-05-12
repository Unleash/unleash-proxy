import { IProxyConfig } from '../config';
import Client from '../client';
import { defaultStrategies } from 'unleash-client/lib/strategy';
import FakeUnleash from './unleash.mock';
import FakeMetrics from './metrics.mock';

export const createFakeClient = (
    config: IProxyConfig,
): { client: Client; metrics: FakeMetrics } => {
    const unleash = new FakeUnleash({
        ...config,
        url: config.unleashUrl,
        appName: config.unleashAppName,
    });

    const metrics = new FakeMetrics({
        appName: config.unleashAppName,
        instanceId: config.unleashInstanceId,
        metricsInterval: config.metricsInterval,
        url: config.unleashUrl,
        strategies: defaultStrategies.map((s) => s.name),
    });

    const client = new Client(config, unleash, metrics);

    return { client, metrics };
};
