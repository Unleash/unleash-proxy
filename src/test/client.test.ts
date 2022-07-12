import { UnleashConfig } from 'unleash-client/lib/unleash';
import Client from '../client';
import { createProxyConfig } from '../config';
import { LogLevel } from '../logger';
import FakeUnleash from './unleash.mock';

test('should add environment to isEnabled calls', () => {
    let unleashSDK: FakeUnleash;
    const init = (opts: UnleashConfig) => {
        unleashSDK = new FakeUnleash(opts);
        return unleashSDK;
    };

    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'test',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = new Client(config, init);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
    });

    client.getEnabledToggles({});

    expect(fakeUnleash.contexts[0].environment).toBe('test');
    client.destroy();
});

test('should override environment to isEnabled calls', () => {
    let unleashSDK: FakeUnleash;
    const init = (opts: UnleashConfig) => {
        unleashSDK = new FakeUnleash(opts);
        return unleashSDK;
    };

    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'never-change-me',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = new Client(config, init);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
    });

    client.getEnabledToggles({ environment: 'some' });

    expect(fakeUnleash.contexts[0].environment).toBe('never-change-me');
    client.destroy();
});
