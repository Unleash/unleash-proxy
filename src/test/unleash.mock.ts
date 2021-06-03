/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context, Unleash, Variant } from 'unleash-client';
import { FeatureInterface } from 'unleash-client/lib/feature';
import { FallbackFunction } from 'unleash-client/lib/helpers';
import { UnleashConfig } from 'unleash-client/lib/unleash';

class FakeUnleash extends Unleash {
    public toggleDefinitions: FeatureInterface[] = [];

    public contexts: Context[] = [];

    public unleashConfig: UnleashConfig;

    // fix constructor
    constructor(unleashConfig: UnleashConfig) {
        super(unleashConfig);
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

    getFeatureToggleDefinitions(): FeatureInterface[] {
        return this.toggleDefinitions;
    }

    count(toggleName: string, enabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    countVariant(toggleName: string, variantName: string): void {
        throw new Error('Method not implemented.');
    }
}

export default FakeUnleash;
