import SwaggerParser from '@apidevtools/swagger-parser';
import type { Application } from 'express';
import request from 'supertest';
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

test('should serve the OpenAPI UI', async () => {
    const res = await request(app).get('/docs/openapi/').expect(200);
    const body = res.text;
    expect(body).toMatchSnapshot();
});

test('validate open api response', async () => {
    const res = await request(app).get('/docs/openapi.json').expect(200);
    await SwaggerParser.validate(res.body);
});

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
