import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../app';
import MockClient from './client.mock';

const unleashUrl = 'http://localhost:4242/test';
const unleashApiToken = 'unleashApiToken';
const proxySecrets = ['proxySecrets'];
let app: Application;

beforeEach(() => {
    app = createApp(
        { proxySecrets, unleashUrl, unleashApiToken, enableOAS: true },
        new MockClient([]),
    );
});

test('should serve the OpenAPI UI', async () =>
    request(app)
        .get('/docs/openapi/')
        .expect(200)
        .then((response) => expect(response.text).toMatchSnapshot()));

test('should serve the OpenAPI spec', async () =>
    request(app)
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            // The version field is not set when running jest without yarn/npm.
            delete res.body.info.version;
            // This test will fail whenever there's a change to the API spec.
            // If the change is intended, update the snapshot with `jest -u`.
            expect(res.body).toMatchSnapshot();
        }));
