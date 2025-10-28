import { defaultStrategies } from 'unleash-client/lib/strategy';
import Client from '../client';
import type { IProxyConfig } from '../config';
import FakeMetrics from './metrics.mock';
import FakeUnleash from './unleash.mock';

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
        connectionId: 'connection-id',
    });

    const client = new Client(config, unleash, metrics);

    return { client, metrics };
};
