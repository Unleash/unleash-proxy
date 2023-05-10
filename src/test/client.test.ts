import { createProxyConfig } from '../config';
import { LogLevel } from '../logger';
import FakeUnleash from './unleash.mock';
import { createFakeClient } from './create-fake-client';

test('should add environment to isEnabled calls', () => {
    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'test',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = createFakeClient(config);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    client.getEnabledToggles({});

    expect(fakeUnleash.contexts[0].environment).toBe('test');
    client.destroy();
});

test('should override environment to isEnabled calls', () => {
    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'never-change-me',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = createFakeClient(config);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    client.getEnabledToggles({ environment: 'some' });

    expect(fakeUnleash.contexts[0].environment).toBe('never-change-me');
    client.destroy();
});

test('should return all toggles', () => {
    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'never-change-me',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = createFakeClient(config);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    fakeUnleash.toggleDefinitions.push({
        name: 'test-2',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    fakeUnleash.toggleDefinitions.push({
        name: 'test-3',
        enabled: true,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    const result = client.getAllToggles({ environment: 'some' });

    expect(result.length).toBe(3);
    client.destroy();
});

test('should return default variant for disabled toggles', () => {
    const config = createProxyConfig({
        unleashApiToken: '123',
        unleashUrl: 'http://localhost:4242/api',
        proxySecrets: ['s1'],
        environment: 'never-change-me',
        logLevel: LogLevel.error,
    });

    config.disableMetrics = true;

    const client = createFakeClient(config);

    const fakeUnleash = client.unleash as FakeUnleash;

    fakeUnleash.toggleDefinitions.push({
        name: 'test',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    fakeUnleash.toggleDefinitions.push({
        name: 'test-2',
        enabled: false,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    fakeUnleash.toggleDefinitions.push({
        name: 'test-3',
        enabled: true,
        stale: false,
        strategies: [],
        variants: [],
        impressionData: true,
        type: 'experiment',
        project: 'default',
    });

    const result = client.getAllToggles({ environment: 'some' });

    expect(result.length).toBe(3);
    expect(result[0].variant?.name).toBe('disabled');
    expect(result[0].variant?.enabled).toBe(false);
    expect(result[1].variant?.name).toBe('disabled');
    expect(result[1].variant?.enabled).toBe(false);
    expect(result[2].variant?.name).toBe('disabled');
    expect(result[2].variant?.enabled).toBe(false);
    client.destroy();
});
