const port = process.env.PORT || process.env.PROXY_PORT || 3000;

const { createApp } = require('./dist/app');

const app = createApp({
    unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
    unleashApiToken:
        'demo-app:default.1d0fd3109556631d8e9469c75090f46f2ec269d094543890c9a81c4a',
    clientKeys: ['proxy-secret', 'another-proxy-secret', 's1'],
    refreshInterval: 1000,
    //logLevel: 'trace',
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
    logLevel: 'debug',
    // projectName: 'order-team', // optional
    // environment: 'development',
});

app.listen(port, () =>
    console.log(`Unleash-proxy is listening on port ${port}!`),
);
