import request, { type Response } from 'supertest';
import { createApp } from '../app';
import metrics from '../examples/metrics.json';
import MockClient from './client.mock';

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
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
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

test('Should handle POST with empty/nonsensical body', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    await Promise.all(
        [{ blah: 'hello' }, undefined, {}].map((body) =>
            request(app)
                .post('/proxy')
                .type('json')
                .send(body)
                .set('Accept', 'application/json')
                .set('Authorization', 'sdf')
                .expect(200)
                .expect('Content-Type', /json/)
                .then((response) => {
                    expect(response.body.toggles).toHaveLength(2);
                }),
        ),
    );
});

test('Should handle POST with extra context properties', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy')
        .send({
            context: {
                customProperty: 'string',
                properties: { otherCustomProperty: 24 },
            },
        })
        .set('Accept', 'application/json')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);
});

test('Should handle POST with toggle names', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
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
        .post('/proxy')
        .send({ toggles: ['test'] })
        .set('Accept', 'application/json')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
            expect(response.body.toggles).toHaveLength(1);
            expect(response.body.toggles[0].name).toBe('test');
        });
});

test('Should return list of toggles with custom proxy client key header', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            proxySecrets,
            unleashUrl,
            unleashApiToken,
            clientKeysHeaderName: 'NotAuthorized',
        },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy')
        .set('NotAuthorized', 'sdf')
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
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
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
            impressionData: true,
        },
        {
            name: 'test2',
            enabled: true,
            impressionData: true,
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
            impressionData: true,
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
        .get('/proxy?userId=123&tenantId=me')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(client.queriedContexts[0].userId).toEqual('123');
    expect(client.queriedContexts[0].properties?.tenantId).toEqual('me');
});

test('Should send in context with ip as remoteAddress', async () => {
    const userIp = '123.13.13.42';

    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken, trustProxy: true },
        client,
    );
    client.emit('ready');

    await request(app)
        .get('/proxy?userId=123&tenantId=me')
        .set('Authorization', 'sdf')
        .set('X-Forwarded-For', userIp)
        .expect(200)
        .expect('Content-Type', /json/);

    expect(client.queriedContexts[0].remoteAddress).toEqual(userIp);
});

test('Should remove "undefined" environment field from context', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            unleashUrl,
            unleashApiToken,
            proxySecrets,
            environment: 'test',
        },
        client,
    );
    client.emit('ready');

    await request(app)
        .get('/proxy?userId=123&tenantId=me')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(client.queriedContexts[0]).not.toHaveProperty('environment');
});

test('Providing a string for `properties` yields a 400', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            unleashUrl,
            unleashApiToken,
            proxySecrets,
            environment: 'test',
        },
        client,
    );
    client.emit('ready');

    await request(app)
        .get('/proxy?userId=123&properties=string')
        .set('Authorization', 'sdf')
        .expect(400);
});

test('Should register metrics', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/client/metrics')
        .send(metrics)
        .set('Authorization', 'sdf')
        .expect(200);
});

test('Should register metrics an /all path as well', () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/all/client/metrics')
        .send(metrics)
        .set('Authorization', 'sdf')
        .expect(200);
});

test('Should require metrics to have correct format', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/client/metrics')
        .send({ some: 'blob' })
        .set('Authorization', 'sdf')
        .expect(400);
});

test('Should return errors as JSON', () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/client/metrics')
        .send({ some: 'blob' })
        .set('Authorization', 'sdf')
        .expect(400)
        .expect('Content-Type', /json/);
});

describe.each([
    '',
    '/all',
    '/health',
    '/client/features',
    '/internal-backstage/prometheus',
])('GET should return not ready', (url) => {
    test(`for ${url}`, () => {
        const client = new MockClient();

        const proxySecrets = ['sdf'];
        const app = createApp(
            { unleashUrl, unleashApiToken, proxySecrets },
            client,
        );

        return request(app).get(`/proxy${url}`).expect(503);
    });
});

describe.each([
    '',
    '/all',
    '/client/features',
])('Requires valid token', (url) => {
    test(`Should return 401 if invalid api token for ${url}`, () => {
        const client = new MockClient();

        const proxySecrets = ['secret'];
        const app = createApp(
            { proxySecrets, unleashUrl, unleashApiToken },
            client,
        );
        client.emit('ready');

        return request(app)
            .get(`/proxy${url}`)
            .set('Authorization', 'I do not know your secret')
            .expect(401);
    });

    test(`Should return 401 if no api token for ${url}`, () => {
        const client = new MockClient();

        const proxySecrets = ['secret'];
        const app = createApp(
            { proxySecrets, unleashUrl, unleashApiToken },
            client,
        );
        client.emit('ready');

        return request(app).get(`/proxy${url}`).expect(401);
    });
});

describe.each([
    { url: '/health', responseBody: 'ok' },
    {
        url: '/internal-backstage/prometheus',
        responseBody: 'unleash_proxy_up 1',
    },
])('Do not require valid token', ({ url, responseBody }) => {
    test(`Should not require a token for ${url}`, () => {
        const client = new MockClient();

        const proxySecrets = ['sdf'];
        const app = createApp(
            { unleashUrl, unleashApiToken, proxySecrets },
            client,
        );
        client.emit('ready');

        return request(app)
            .get(`/proxy${url}`)
            .expect(200)
            .then((response) => {
                expect(response.text).toMatch(responseBody);
            });
    });
});

test('Should return 504 for proxy', () => {
    const client = new MockClient();

    const app = createApp({ unleashUrl, unleashApiToken }, client);

    return request(app)
        .get('/proxy')
        .set('Authorization', 'secret2')
        .expect(503);
});

test('Should allow every origin (*)', async () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    const response = await request(app)
        .get('/proxy?userId=999&tenantId=me')
        .set('Origin', 'https://test.com')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(response.headers).toHaveProperty('access-control-allow-origin', '*');
});

test('Should return the same origin based on cors options', async () => {
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            proxySecrets,
            unleashUrl,
            unleashApiToken,
            cors: {
                origin: [
                    'https://example.com',
                    'https://demo.unleash-hosted.com',
                ],
            },
        },
        client,
    );
    client.emit('ready');

    const response = await request(app)
        .get('/proxy?userId=999&tenantId=me')
        .set('Origin', 'https://demo.unleash-hosted.com')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect('Content-Type', /json/);

    expect(response.headers).toHaveProperty(
        'access-control-allow-origin',
        'https://demo.unleash-hosted.com',
    );
});

test('Should return 400 bad request for malformed JSON', async () => {
    const body = '{ toggles": [] }';
    const client = new MockClient();

    const proxySecrets = ['sdf'];
    const app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken },
        client,
    );
    client.emit('ready');

    await request(app)
        .post('/proxy')
        .type('json')
        .send(body)
        .set('Accept', 'application/json')
        .set('Authorization', 'sdf')
        .expect(400)
        .expect('Content-Type', /json/);
});

test('Should register server SDK', async () => {
    const toggles = [
        {
            name: 'test',
            enabled: true,
            impressionData: true,
        },
    ];
    const client = new MockClient(toggles);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            unleashUrl,
            unleashApiToken,
            proxySecrets,
            expServerSideSdkConfig: { tokens: ['s1'] },
        },
        client,
    );
    client.emit('ready');

    const res = await request(app)
        .post('/proxy/client/register')
        .send({
            appName: 'test',
            instanceId: 'i1',
            sdkVersion: 'custom1',
            environment: 'prod',
            interval: 10000,
            started: new Date(),
            strategies: ['default'],
        })
        .set('Authorization', 'sdf');

    expect(res.statusCode).toBe(200);
});

test('Should return all feature toggles', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'b', enabled: false, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets, enableAllEndpoint: true },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy/all')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect((res) => {
            expect(res.body.toggles.length).toBe(3);
        });
});

test('/client/features should return toggle definitions', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'b', enabled: false, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            unleashUrl,
            unleashApiToken,
            proxySecrets,
            enableAllEndpoint: true,
            expServerSideSdkConfig: { tokens: ['server-side'] },
        },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy/client/features')
        .set('Authorization', 'server-side')
        .expect(200)
        .expect((res) => {
            expect(res.body.features.length).toBe(3);
            expect(res.body.features[0].strategies.length).toBe(1);
        });
});

test('/client/features should not accept proxy secret', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'b', enabled: false, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        {
            unleashUrl,
            unleashApiToken,
            proxySecrets,
            enableAllEndpoint: true,
            expServerSideSdkConfig: { tokens: ['server-side'] },
        },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy/client/features')
        .set('Authorization', 'sdf')
        .expect(401);
});

test('Should return all feature toggles via POST', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'b', enabled: false, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets, enableAllEndpoint: true },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/all')
        .send({
            context: {
                customProperty: 'string',
                properties: { otherCustomProperty: 24 },
            },
        })
        .set('Authorization', 'sdf')
        .expect(200)
        .expect((res) => {
            expect(res.body.toggles.length).toBe(3);
        });
});

test('Should return all named feature toggles via POST', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'b', enabled: false, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets, enableAllEndpoint: true },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy/all')
        .send({
            toggles: ['a'],
            context: {
                customProperty: 'string',
                properties: { otherCustomProperty: 24 },
            },
        })
        .set('Authorization', 'sdf')
        .expect(200)
        .expect((res) => {
            expect(res.body.toggles.length).toBe(1);
            expect(res.body.toggles[0].name).toBe('a');
        });
});

test('Should return all enabled feature toggles when POST-ing', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
        { name: 'c', enabled: true, impressionData: true },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets, enableAllEndpoint: true },
        client,
    );
    client.emit('ready');

    return request(app)
        .post('/proxy')
        .set('Authorization', 'sdf')
        .expect(200)
        .expect((res) => {
            expect(res.body.toggles.length).toBe(2);
        });
});

test('Should return 501 when all feature toggles is not enabled', () => {
    const client = new MockClient([
        { name: 'a', enabled: true, impressionData: false },
    ]);

    const proxySecrets = ['sdf'];
    const app = createApp(
        { unleashUrl, unleashApiToken, proxySecrets },
        client,
    );
    client.emit('ready');

    return request(app)
        .get('/proxy/all')
        .set('Authorization', 'sdf')
        .expect(501);
});

describe('Request content-types', () => {
    test.each([
        '/proxy',
        '/proxy/all',
    ])('Should assign default content-type if the request has a body but no content-type (%s)', async (endpoint) => {
        const client = new MockClient();
        const payload = {
            context: { appName: 'my-app' },
        };

        const proxySecrets = ['sdf'];
        const app = createApp(
            {
                unleashUrl,
                unleashApiToken,
                proxySecrets,
                enableAllEndpoint: true,
            },
            client,
        );
        client.emit('ready');

        await request(app)
            .post(endpoint)
            .set('Authorization', 'sdf')
            .set('Content-Type', '')
            .send(payload)
            .expect(200)
            .then(() => {
                expect(client.queriedContexts[0].appName).toEqual(
                    payload.context.appName,
                );
            });
    });

    test.each([
        '/proxy',
        '/proxy/all',
    ])('Should reject non-"content-type: application/json" for POST requests to %s', (endpoint) => {
        const client = new MockClient();

        const proxySecrets = ['sdf'];
        const app = createApp(
            {
                unleashUrl,
                unleashApiToken,
                proxySecrets,
                enableAllEndpoint: true,
            },
            client,
        );
        client.emit('ready');

        return request(app)
            .post(endpoint)
            .set('Authorization', 'sdf')
            .set('Content-Type', 'application/html')
            .send('<em>reject me!</em>')
            .expect(415);
    });
});
