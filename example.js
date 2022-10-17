const port = process.env.PORT || process.env.PROXY_PORT || 3000;

const { createApp } = require('./dist/app');

const app = createApp({
    unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
    unleashApiToken:
        '*:development.a113e11e04133c367f5fa7c731f9293c492322cf9d6060812cfe3fea',
    clientKeys: ['proxy-secret', 'another-proxy-secret', 's1'],
    refreshInterval: 1000,
    logLevel: 'trace',
    enableOAS: true,
    expServerSideSdkConfig: {
        tokens: ['server'],
    },
    expBootstrap: {
        url: 'https://localhost:4000',
        urlHeaders: {
            Authorization: 'bootstrap-token',
        },
    },
    // unleashInstanceId: '1337',
    // logLevel: 'info',
    // projectName: 'order-team', // optional
    // environment: 'development',
});

app.listen(port, () =>
    console.log(`Unleash-proxy is listening on port ${port}!`),
);
