const port = process.env.PORT || 3000;

const { createApp } = require('./dist/app');

const app = createApp({
    unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
    unleashApiToken: '56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d',
    proxySecrets: ['proxy-secret', 'another-proxy-secret', 's1'],
    refreshInterval: 1000,
    // unleashInstanceId: '1337',
    // logLevel: 'info',
    // projectName: 'order-team', // optional
    // environment: 'development',
});

app.listen(port, () =>
  console.log(`Unleash-proxy is listening on port ${port}!`),
);
