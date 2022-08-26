![Build & Tests](https://github.com/Unleash/unleash-proxy/workflows/Node.js%20CI/badge.svg?branch=main)
[![npm](https://img.shields.io/npm/v/@unleash/proxy)](https://www.npmjs.com/package/@unleash/proxy)
[![Docker Pulls](https://img.shields.io/docker/pulls/unleashorg/unleash-proxy)](https://hub.docker.com/r/unleashorg/unleash-proxy)


# The Unleash Proxy

The Unleash Proxy simplifies integration with frontend & native applications running in the context of a specific user. The Unleash proxy sits between the proxy SDK and the 
Unleash API and ensures that your internal feature toggle configuration is not 
exposed to the world. 

The proxy offers:

- **High performance** - a single proxy instance can handle thousands req/s, and can be horizontally scaled. 
- **Privacy for end-users** - Your end users are not exposed to the unleash API and can be hosted by you This ensures no user data (userId, IPs, etc) is shared. 
- **Secure** - It is controlled by you, and can hosted on your domain. In addition no feature toggle configuration is shared with the user, only evaluated toggles. 


You can read more about [the proxy in our documentation](https://docs.getunleash.io/sdks/unleash-proxy)

## Run The Unleash Proxy

The Unleash proxy is a small stateless HTTP application you run. The only requirement is that it needs to be able to talk with the Unleash API (either Unleash OSS or Unleash Hosted). 


### Run with Docker

The easies way to run Unleash is via Docker. We have published a [docker image on docker hub](https://hub.docker.com/r/unleashorg/unleash-proxy/). 

**Step 1: Pull**

```bash
docker pull unleashorg/unleash-proxy
```

**Step 2: Start**

```bash
docker run \
   -e UNLEASH_PROXY_CLIENT_KEYS=some-secret \
   -e UNLEASH_URL=https://app.unleash-hosted.com/demo/api/ \
   -e UNLEASH_API_TOKEN=56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d \
   -p 3000:3000 \
   unleashorg/unleash-proxy
```

You should see the following output:

```bash
Unleash-proxy is listening on port 3000!
````


**Step 3: verify**

In order to verify the proxy you can use curl and see that you get a few evaluated feature toggles back:

```bash
curl http://localhost:3000/proxy -H "Authorization: some-secret"  
```

Expected output would be something like:

```json
{
	"toggles": [{
		"name": "demo",
		"enabled": true,
		"variant": {
			"name": "disabled",
			"enabled": false
		}
	}, {
		"name": "demoApp.step1",
		"enabled": true,
		"variant": {
			"name": "disabled",
			"enabled": false
		}
	}]
}
```

**Health endpoint**

The proxy will try to synchronize with the Unleash API at startup, until it has successfully done that the proxy will return `HTTP 503 - Not Read?` for all request. You can use the health endpoint to validate that the proxy is ready to recieve requests:

```bash
curl http://localhost:3000/proxy/health -I
``` 

```bash
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: ETag
Content-Type: text/html; charset=utf-8
Content-Length: 2
ETag: W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"
Date: Fri, 04 Jun 2021 10:38:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

### Available options

| Option               | Environment Variable             | Default value   | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|----------------------|----------------------------------|-----------------|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| unleashUrl           | `UNLEASH_URL`                    | n/a             |   yes    | API Url to the Unleash instance to connect to                                                                                                                                                                                                                                                                                                                                                                                                                            |
| unleashApiToken      | `UNLEASH_API_TOKEN`              | n/a             |   yes    | API token (client) needed to connect to Unleash API.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| clientKeys           | `UNLEASH_PROXY_CLIENT_KEYS`      | n/a             |   yes    | List of client keys that the proxy should accept. When querying the proxy, Proxy SDKs must set the request's _client keys header_ to one of these values. The default client keys header is `Authorization`.                                                                                                                                                                                                                                                             |
| proxySecrets         | `UNLEASH_PROXY_SECRETS`          | n/a             |    no    | Deprecated alias for `clientKeys`. Please use `clientKeys` instead.                                                                                                                                                                                                                                                                                                                                                                                                      |
| n/a                  | `PORT` or `PROXY_PORT`           | 3000            |    no    | The port where the proxy should listen.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| proxyBasePath        | `PROXY_BASE_PATH`                | ""              |    no    | The base path to run the proxy from. "/proxy" will be added at the end. For instance, if `proxyBasePath` is `"base/path"`, the proxy will run at `/base/path/proxy`.                                                                                                                                                                                                                                                                                                     |
| unleashAppName       | `UNLEASH_APP_NAME`               | "unleash-proxy" |    no    | App name to used when registering with Unleash                                                                                                                                                                                                                                                                                                                                                                                                                           |
| unleashInstanceId    | `UNLEASH_INSTANCE_ID`            | `generated`     |    no    | Unleash instance id to used when registering with Unleash                                                                                                                                                                                                                                                                                                                                                                                                                |
| refreshInterval      | `UNLEASH_FETCH_INTERVAL`         | 5000            |    no    | How often the proxy should query Unleash for updates, defined in ms.                                                                                                                                                                                                                                                                                                                                                                                                     |
| metricsInterval      | `UNLEASH_METRICS_INTERVAL`       | 30000           |    no    | How often the proxy should send usage metrics back to Unleash, defined in ms.                                                                                                                                                                                                                                                                                                                                                                                            |
| environment          | `UNLEASH_ENVIRONMENT`            | `undefined`     |    no    | If set this will be the `environment` used by the proxy in the Unleash Context. It will not be possible for proxy SDKs to override the environment if set.                                                                                                                                                                                                                                                                                                               |
| projectName          | `UNLEASH_PROJECT_NAME`           | `undefined`     |    no    | The projectName (id) to fetch feature toggles for. The proxy will only return know about feature toggles that belongs to the project, if specified.                                                                                                                                                                                                                                                                                                                      | |
| logger               | n/a                              | SimpleLogger    |    no    | Register a custom logger.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| logLevel             | `LOG_LEVEL `                     | "warn"          |    no    | Used to set logLevel. Supported options: "debug", "info", "warn", "error" and "fatal"                                                                                                                                                                                                                                                                                                                                                                                    |
| customStrategies     | `UNLEASH_CUSTOM_STRATEGIES_FILE` | []	             |   no		   | Use this option to inject implementation of custom activation strategies. If you are using `UNLEASH_CUSTOM_STRATEGIES_FILE` you need to provide a valid path to a javascript files which exports an array of custom activation strategies and the SDK will automatically load these                                                                                                                                                                                      |
| trustProxy           | `TRUST_PROXY `                   | `false`         |    no    | By enabling the trustProxy option, Unleash Proxy will have knowledge that it's sitting behind a proxy and that the X-Forwarded-* header fields may be trusted, which otherwise may be easily spoofed. The proxy will automatically enrich the ip address in the Unleash Context. Can either be `true/false` (Trust all proxies), trust only given IP/CIDR (e.g. `'127.0.0.1'`) as a `string`. May be a list of comma separated values (e.g. `'127.0.0.1,192.168.1.1/24'` |
| namePrefix           | `UNLEASH_NAME_PREFIX`            | undefined       |    no    | Used to filter features by using prefix when requesting backend values.                                                                                                                                                                                                                                                                                                                                                                                                  |
| tags                 | `UNLEASH_TAGS`                   | undefined       |    no    | Used to filter features by using tags set for features. Format should be `tagName:tagValue,tagName2:tagValue2`                                                                                                                                                                                                                                                                                                                                                           |
| clientKeysHeaderName | `CLIENT_KEY_HEADER_NAME`         | "authorization" |    no    | The name of the HTTP header to use for client keys. Incoming requests must set the value of this header to one of the Proxy's `clientKeys` to be authorized successfully.                                                                                                                                                                                                                                                                                                |
| enableOAS            | `ENABLE_OAS`                     | `false`         |    no    | Set to `true` to expose the proxy's OpenAPI spec at `/docs/openapi.json` and an interactive OpenAPI UI at `/docs/openapi`. Read more in the [OpenAPI section](#openapi).                                                                                                                                                                                                                                                                                                 |
| cors | n/a        | n/a             | no       | Pass custom options for [CORS module](https://www.npmjs.com/package/cors#configuration-options) |
| cors.origin | `CORS_ORIGIN`        | *             | no       | Origin URL or list of comma separated list of URLs to whitelist for CORS |
| cors.maxAge | `CORS_MAX_AGE`       | 172800        | no       | Maximum number of seconds to cache CORS results  |



### Experimental options

Some functionality is under validation and introduced as experimental, to allow us to test new functionality early. You should expect these to change in any future feature release. 

| Option                                | Environment Variable                | Default value | Required | Description                                                                                                                                    |
|---------------------------------------|-------------------------------------|---------------|:--------:|------------------------------------------------------------------------------------------------------------------------------------------------|
| expBootstrap                          | n/a                                 | n/a           |    no    | Where the Proxy can bootstrap configuration from. See [Node.js SDK](https://github.com/Unleash/unleash-client-node#bootstrap) for details.     |
| expBootstrap.url                      | `EXP_BOOTSTRAP_URL`                 | n/a           |    no    | Url where the Proxy can bootstrap configuration from. See [Node.js SDK](https://github.com/Unleash/unleash-client-node#bootstrap) for details. |
| expBootstrap.urlHeaders.Authorization | `EXP_BOOTSTRAP_AUTHORIZATION`       | n/a           |    no    | Authorization header value to be used when bootstrapping                                                                                       |
| expServerSideSdkConfig.tokens         | `EXP_SERVER_SIDE_SDK_CONFIG_TOKENS` | n/a           |    no    | API tokens that can be used by Server SDKs (and proxies) to read feature toggle configuration from this Proxy instance.                        |
### Run with Node.js:

**STEP 1: Install dependency**

```
npm install @unleash/proxy
```


**STEP 2: use in your code**

```js
const port = 3000;

const { createApp } = require('@unleash/proxy');


const app = createApp({
    unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
    unleashApiToken: '56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d',
    clientKeys: ['proxy-secret', 'another-proxy-secret', 's1'],
    refreshInterval: 1000,
    // logLevel: 'info',
    // projectName: 'order-team',
    // environment: 'development',
});

app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`Unleash Proxy listening on http://localhost:${port}/proxy`),
);

```


## Proxy clients
To make the integration simple we have developed proxy client SDKs. You can find them all in our [documentation](https://docs.getunleash.io/sdks/unleash-proxy#how-to-connect-to-the-proxy):


- [JavaScript Proxy SDK (browser)](https://github.com/unleash-hosted/unleash-proxy-client-js)
- [Android Proxy SDK](https://github.com/Unleash/unleash-android-proxy-sdk)
- [iOS Proxy SDK](https://github.com/Unleash/unleash-proxy-client-swift)

## OpenAPI

The proxy can optionally expose a runtime-generated OpenAPI JSON spec and a corresponding OpenAPI UI for its API. The OpenAPI UI page is an interactive page where you can discover and test the API endpoints the proxy exposes. The JSON spec can be used to generate an OpenAPI client with OpenAPI tooling such as the [OpenAPI generator](https://openapi-generator.tech/).

To enable the JSON spec and UI, set `ENABLE_OAS` (environment variable) or `enableOAS` (in-code configuration variable) to `true`.

The spec and UI can then be found at `<base url>/docs/openapi.json` and `<base url>/docs/openapi` respectively.
