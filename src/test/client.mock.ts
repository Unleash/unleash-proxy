import EventEmitter from 'events';
import { Context } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { FeatureToggleStatus, IClient, IMetrics } from '../client';

class MockClient extends EventEmitter implements IClient {
    public apiToken: String;

    public queriedContexts: Context[] = [];

    public toggles: FeatureToggleStatus[];

    public metrics: IMetrics[] = [];

    constructor(toggles: FeatureToggleStatus[] = []) {
        super();
        this.toggles = toggles;
        this.apiToken = 'default';
    }

    getFeatureToggleDefinitions(): FeatureInterface[] {
        throw new Error('Method not implemented.');
    }

    isReady(): boolean {
        return false;
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

    registerMetrics(metrics: IMetrics): void {
        this.metrics.push(metrics);
    }
}

export default MockClient;
