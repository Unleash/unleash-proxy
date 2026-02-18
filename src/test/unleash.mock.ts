/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Context, Unleash, type Variant } from 'unleash-client';
import type { FeatureInterface } from 'unleash-client/lib/feature';
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
    isEnabled(_name: any, context?: any, _fallbackValue?: any): boolean {
        this.contexts.push(context);
        // console.log(name, context, fallbackValue);
        return true;
    }

    getVariant(
        _name: string,
        _context?: Context,
        _fallbackVariant?: Variant,
    ): VariantWithFeatureStatus {
        // console.log(name, context, fallbackVariant);
        return { name: 'disabled', enabled: false, featureEnabled: false };
    }

    forceGetVariant(
        _name: string,
        _context?: Context,
        _fallbackVariant?: Variant,
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

    count(_toggleName: string, _enabled: boolean): void {
        throw new Error('Method not implemented.');
    }

    countVariant(_toggleName: string, _variantName: string): void {
        throw new Error('Method not implemented.');
    }
}

export default FakeUnleash;
