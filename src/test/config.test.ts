import * as path from 'path';
import { Strategy } from 'unleash-client';
import { createProxyConfig } from '../config';

test('should require "unleashUrl', () => {
    const t = () => createProxyConfig({});
    expect(t).toThrow(TypeError);
    expect(t).toThrow('You must specify the unleashUrl option (UNLEASH_URL)');
});

test('should require "unleashApiToken', () => {
    const t = () => createProxyConfig({ unleashUrl: 'some' });
    expect(t).toThrow(TypeError);
    expect(t).toThrow(
        'You must specify the unleashApiToken option (UNLEASH_API_TOKEN)',
    );
});

test('should be valid options', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
    });

    expect(config.unleashUrl).toBe('some');
});

test('should set trust proxy', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
        trustProxy: true,
    });

    expect(config.trustProxy).toBe(true);
});

test('should set instanceId', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        unleashInstanceId: 'someId1',
        proxySecrets: ['s1'],
    });

    expect(config.unleashInstanceId).toBe('someId1');
});

test('should generate instanceId', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
    });

    expect(config.unleashInstanceId).toBeDefined();
    expect(config.unleashInstanceId.length).toBeGreaterThan(3);
});

test('should set trust proxy to "loopback"', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
        trustProxy: 'loopback',
    });

    expect(config.trustProxy).toBe('loopback');
});

test('should set trust proxy via env var', () => {
    process.env.TRUST_PROXY = 'true';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
    });

    expect(config.trustProxy).toBe(true);
    delete process.env.TRUST_PROXY;
});

test('should allow options via env', () => {
    process.env.UNLEASH_URL = 'some';
    process.env.UNLEASH_API_TOKEN = 'token';
    process.env.UNLEASH_PROXY_CLIENT_KEYS = 's1';
    process.env.UNLEASH_INSTANCE_ID = 'i1';
    const config = createProxyConfig({});

    expect(config.unleashUrl).toBe('some');
    expect(config.unleashApiToken).toBe('token');
    expect(config.clientKeys.length).toBe(1);
    expect(config.clientKeys[0]).toBe('s1');
    expect(config.unleashInstanceId).toBe('i1');

    // cleanup
    delete process.env.UNLEASH_URL;
    delete process.env.UNLEASH_API_TOKEN;
    delete process.env.UNLEASH_PROXY_CLIENT_KEYS;
    delete process.env.UNLEASH_INSTANCE_ID;
});

test('should allow old "UNLEASH_PROXY_SECRETS" option via env', () => {
    process.env.UNLEASH_URL = 'some';
    process.env.UNLEASH_API_TOKEN = 'token';
    process.env.UNLEASH_PROXY_SECRETS = 's1-token, s2-token';
    const config = createProxyConfig({});

    expect(config.unleashUrl).toBe('some');
    expect(config.unleashApiToken).toBe('token');
    expect(config.clientKeys.length).toBe(2);
    expect(config.clientKeys[0]).toBe('s1-token');
    expect(config.clientKeys[1]).toBe('s2-token');

    // cleanup
    delete process.env.UNLEASH_URL;
    delete process.env.UNLEASH_API_TOKEN;
    delete process.env.UNLEASH_PROXY_SECRETS;
});

test('should load custom activation strategy', () => {
    class TestStrat extends Strategy {
        constructor() {
            super('TestStrat');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isEnabled(parameters: any, context: any) {
            return true;
        }
    }

    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
        customStrategies: [new TestStrat()],
    });

    expect(config.customStrategies?.length).toBe(1);
    if (config.customStrategies) {
        expect(config.customStrategies[0].name).toBe('TestStrat');
    } else {
        throw new Error('Expected custom strategy to be set!');
    }
});

test('should load custom activation strategy from file', () => {
    const base = path.resolve('');
    process.env.UNLEASH_CUSTOM_STRATEGIES_FILE = `${base}/src/examples/custom-strategies.js`;

    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.customStrategies?.length).toBe(1);
    if (config.customStrategies) {
        expect(config.customStrategies[0].name).toBe('FromFile');
    } else {
        throw new Error('Expected custom strategy to be set!');
    }

    delete process.env.UNLEASH_CUSTOM_STRATEGIES_FILE;
});

test('should set namePrefix via options', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        namePrefix: 'somePrefix',
        clientKeys: ['s1'],
    });

    expect(config.namePrefix).toBe('somePrefix');
});

test('should set namePrefix via env', () => {
    process.env.UNLEASH_NAME_PREFIX = 'prefixViaEnv';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.namePrefix).toBe('prefixViaEnv');

    delete process.env.UNLEASH_CUSTOM_STRATEGIES_FILE;
});

test('should not set tags', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
    });

    expect(config.tags).toBeUndefined();
});

test('should set tags via opts', () => {
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
        tags: [{ name: 'simple', value: 'proxy' }],
    });

    expect(config.tags).toStrictEqual([{ name: 'simple', value: 'proxy' }]);
});

test('should not set tags with empty env var', () => {
    process.env.UNLEASH_TAGS = '';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.tags).toBeUndefined();
    delete process.env.UNLEASH_CUSTOM_STRATEGIES_FILE;
});

test('should set tags with env var', () => {
    process.env.UNLEASH_TAGS = 'simple:proxy, demo:test';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.tags).toStrictEqual([
        { name: 'simple', value: 'proxy' },
        { name: 'demo', value: 'test' },
    ]);
    delete process.env.UNLEASH_CUSTOM_STRATEGIES_FILE;
});

test('should read serverSideSdkConfig from env vars', () => {
    process.env.EXP_SERVER_SIDE_SDK_CONFIG_TOKENS = 'super1, super2';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.serverSideSdkConfig?.tokens).toStrictEqual([
        'super1',
        'super2',
    ]);
    delete process.env.EXP_SERVER_SIDE_SDK_CONFIG_TOKENS;
});

test('should read bootstrap from env vars', () => {
    process.env.EXP_BOOTSTRAP_URL = 'https://boostrap.unleash.run';
    process.env.EXP_BOOTSTRAP_AUTHORIZATION = 'AUTH-BOOTSTRAP';
    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        clientKeys: ['s1'],
    });

    expect(config.bootstrap).toStrictEqual({
        url: 'https://boostrap.unleash.run',
        urlHeaders: { Authorization: 'AUTH-BOOTSTRAP' },
    });
    delete process.env.EXP_BOOTSTRAP_URL;
    delete process.env.EXP_BOOTSTRAP_AUTHORIZATION;
});
