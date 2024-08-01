/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Context, Unleash, type Variant } from 'unleash-client';
import type {
    EnhancedFeatureInterface,
    FeatureInterface,
} from 'unleash-client/lib/feature';
import type { FallbackFunction } from 'unleash-client/lib/helpers';
import type { UnleashConfig } from 'unleash-client/lib/unleash';
import type { VariantWithFeatureStatus } from 'unleash-client/lib/variant';

class FakeUnleash extends Unleash {
    public toggleDefinitions: FeatureInterface[] = [];

    public contexts: Context[] = [];

    public unleashConfig: UnleashConfig;

    // fix constructor
    constructor(unleashConfig: UnleashConfig) {
        super(unleashConfig);
        super.destroy(); // prevent parent constructor initialization
        this.unleashConfig = unleashConfig;
    }

    isEnabled(
        name: string,
        context?: Context,
        fallbackFunction?: FallbackFunction,
    ): boolean;
    isEnabled(
        name: string,
        context?: Context,
        fallbackValue?: boolean,
    ): boolean;
    isEnabled(name: any, context?: any, fallbackValue?: any): boolean {
        this.contexts.push(context);
        // console.log(name, context, fallbackValue);
        return true;
    }

    getVariant(
        name: string,
        context?: Context,
        fallbackVariant?: Variant,
    ): VariantWithFeatureStatus {
        // console.log(name, context, fallbackVariant);
        return { name: 'disabled', enabled: false, featureEnabled: false };
    }

    forceGetVariant(
        name: string,
        context?: Context,
        fallbackVariant?: Variant,
    ): Variant {
        // console.log(name, context, fallbackVariant);
        return { name: 'disabled', enabled: false };
    }

    getFeatureToggleDefinition(toggleName: string): FeatureInterface {
        const toggle = this.toggleDefinitions.find(
            (t: FeatureInterface) => t.name === toggleName,
        );
        if (!toggle) {
            throw new Error(`Could not find toggle=${toggleName}`);
        }
        return toggle;
    }

    getFeatureToggleDefinitions(): FeatureInterface[];
    getFeatureToggleDefinitions(
        withFullSegments: true,
    ): EnhancedFeatureInterface[];
    getFeatureToggleDefinitions(
        withFullSegments?: true,
    ): FeatureInterface[] | EnhancedFeatureInterface[] {
        if (withFullSegments) {
            throw new Error('Not implemented yet');
        } else {
            return this.toggleDefinitions.map((t) => ({
                name: t.name,
                strategies: [
                    { name: 'default', parameters: {}, constraints: [] },
                ],
                enabled: t.enabled,
                project: 'default',
                stale: false,
                type: 'release',
                variants: [],
                impressionData: false,
            })); // Your implementation for returning FeatureInterface[]
        }
    }

    count(toggleName: string, enabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    countVariant(toggleName: string, variantName: string): void {
        throw new Error('Method not implemented.');
    }
}

export default FakeUnleash;
