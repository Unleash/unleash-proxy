const { createApp } = require('./app');
const port = process.env.PORT || process.env.PROXY_PORT || 3000;

const app = createApp({});

app.listen(port, () => console.log(`Unleash-proxy is listening on port ${port}!`));