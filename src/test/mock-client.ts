import EventEmitter from 'events';
import { Context } from 'unleash-client';
import { FeatureToggleStatus, IClient } from '../client';

class MockClient extends EventEmitter implements IClient {
    public apiToken: String;

    public queriedContexts: Context[] = [];

    public toggles: FeatureToggleStatus[];

    public metrics: any[] = [];

    constructor(toggles: FeatureToggleStatus[] = []) {
        super();
        this.toggles = toggles;
        this.apiToken = 'default';
    }

    setUnleashApiToken(apiToken: string): void {
        this.apiToken = apiToken;
    }

    getEnabledToggles(context: Context): FeatureToggleStatus[] {
        this.queriedContexts.push(context);
        return this.toggles;
    }

    getDefinedToggles(
        toggleNames: string[],
        context: Context,
    ): FeatureToggleStatus[] {
        this.queriedContexts.push(context);
        return this.toggles.filter((t) =>
            toggleNames.some((name) => name === t.name),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    registerMetrics(metrics: any): void {
        this.metrics.push(metrics);
    }
}

export default MockClient;
