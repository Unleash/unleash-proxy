import { createApp } from './app';
import { IProxyOption } from './config';

export function start(opt: IProxyOption = {}): void {
    const port = process.env.PORT || process.env.PROXY_PORT || 3000;

    const app = createApp(opt);

    app.listen(port, () =>
        // eslint-disable-next-line no-console
        console.log(`Unleash-proxy is listening on port ${port}!`),
    );
}
