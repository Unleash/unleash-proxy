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

test('should allow options via env', () => {
    process.env.UNLEASH_URL = 'some';
    process.env.UNLEASH_API_TOKEN = 'token';
    process.env.UNLEASH_PROXY_SECRETS = 's1';
    const config = createProxyConfig({});

    expect(config.unleashUrl).toBe('some');
    expect(config.unleashApiToken).toBe('token');
    expect(config.proxySecrets.length).toBe(1);
    expect(config.proxySecrets[0]).toBe('s1');

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
        proxySecrets: ['s1'],
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
    process.env.UNLEASH_CUSTOM_STRATEGIES_FILE = `${__dirname}/../examples/custom-strategies.js`;

    const config = createProxyConfig({
        unleashUrl: 'some',
        unleashApiToken: 'some',
        proxySecrets: ['s1'],
    });

    expect(config.customStrategies?.length).toBe(1);
    if (config.customStrategies) {
        expect(config.customStrategies[0].name).toBe('FromFile');
    } else {
        throw new Error('Expected custom strategy to be set!');
    }

    delete process.env.UNLEASH_CUSTOM_STRATEGIES_FILE;
});
