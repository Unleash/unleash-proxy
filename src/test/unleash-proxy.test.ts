import request, { Response } from 'supertest';
import { createApp } from '../app';
import MockClient from './mock-client';
import metrics from '../examples/metrics.json';

const unleashUrl = 'http://localhost:4242/test';
const unleashApiToken = 's1';

test('Should return empty list of toggles', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response: Response) => {
            expect(response.body.toggles).toEqual([]);
        });
});

test('Should return list of toggles', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
            expect(response.body.toggles.length).toEqual(2);
        });
});

test('Should return list of toggles using env with multiple secrets', () => {
    process.env.UNLEASH_PROXY_SECRETS = 'secret1,secret2';
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const app = createApp({ unleashUrl, unleashApiToken }, client);
    client.emit('ready');

    return request(app)
        .get('/proxy')
        .set('Authorization', 'secret2')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
            expect(response.body.toggles.length).toEqual(2);
        });
});

test('Should return list of toggles using env with multiple secrets with space', () => {
    process.env.UNLEASH_PROXY_SECRETS = 'secret11, secret22';
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const app = createApp({ unleashUrl, unleashApiToken }, client);
    client.emit('ready');

    return request(app)
        .get('/proxy')
        .set('Authorization', 'secret22')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
            expect(response.body.toggles.length).toEqual(2);
        });
});

test('Should send in context to mock', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    await request(app)
        .get('/proxy?userId=123&tentantId=me')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(client.queriedContexts[0].userId).toEqual('123');
    expect(client.queriedContexts[0].properties?.tentantId).toEqual('me');
});

/*
test('Should remove "undefined" environment field from context', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createAppWithClient({
        client,
        logger,
        proxySecrets,
        environment: 'test',
    });
    client.emit('ready');

    await request(app)
        .get('/proxy?userId=123&tentantId=me')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(client.contexts[0].hasOwnProperty('environment')).toEqual(false);
});

test('Should register metrics', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp({ proxySecrets }, client);
    client.emit('ready');

    return request(app)
        .post('/proxy/client/metrics')
        .send(metrics)
        .set('Authorization', 'sdf')
        .expect(200);
});

test('Should return not ready', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp({ proxySecrets }, client);

    return request(app).get('/proxy/health').expect(503);
});

test('Should return ready', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp({ proxySecrets }, client);
    client.emit('ready');

    return request(app)
        .get('/proxy/health')
        .expect(200)
        .then((response) => {
            expect(response.text).toEqual('ok');
        });
});
*/
