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
        return this.toggles.map((t) => ({
            name: t.name,
            strategies: [{ name: 'default', parameters: {}, constraints: [] }],
            enabled: t.enabled,
            project: 'default',
            stale: false,
            type: 'release',
            variants: [],
            impressionData: false,
        }));
    }

    isReady(): boolean {
        return false;
    }

    setUnleashApiToken(apiToken: string): void {
        this.apiToken = apiToken;
    }

    getAllToggles(context: Context): FeatureToggleStatus[] {
        this.queriedContexts.push(context);
        return this.toggles;
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
