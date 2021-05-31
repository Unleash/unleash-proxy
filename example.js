const port = 3000;

const { createApp } = require('./dist/app');

const app = createApp({
    unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
    unleashApiToken: '56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d',
    proxySecrets: ['proxy-secret', 'another-proxy-secret', 's1'],
    refreshInterval: 1000,
    projectName: 'order-team', //optional
    // environment: 'development',
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));