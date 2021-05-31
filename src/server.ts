const { createApp } = require('./app');

const port = process.env.PORT || process.env.PROXY_PORT || 3000;

const app = createApp({});

app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`Unleash-proxy is listening on port ${port}!`),
);
