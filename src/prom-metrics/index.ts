import { createCounter } from './createCounter';
import { createGauge, type Gauge } from './createGauge';

export * from './createCounter';
export * from './createGauge';

export const lastMetricsUpdate: Gauge = createGauge({
    name: 'last_metrics_update_epoch_timestamp_ms',
    help: 'An epoch timestamp (in milliseconds) set to when our unleash-client last got an update from upstream Unleash',
});

export const lastMetricsFetch: Gauge = createGauge({
    name: 'last_metrics_fetch_epoch_timestamp_ms',
    help: 'An epoch timestamp (in milliseconds) set to when our unleash-client last checked (regardless if there was an update or not)',
});

createCounter({
    name: 'unleash_proxy_up',
    help: 'Indication that the service is up.',
}).inc(1);
