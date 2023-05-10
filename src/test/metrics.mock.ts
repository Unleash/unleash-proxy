/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-unused-vars */

import Metrics from 'unleash-client/lib/metrics';

class FakeMetrics extends Metrics {
    start() {}

    count(name: string, enabled: boolean) {}

    countVariant(name: string, variantName: string) {}

    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return this;
    }
}

export default FakeMetrics;
