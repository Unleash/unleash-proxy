import { Context } from 'unleash-client';

enum EventType {
    isEnabled,
    getVariant,
    customGoal,
}

export interface IUnleashEvent {
    eventId: string;
    createdTimestamp?: Date;
    receivedTimestamp?: Date;
    eventType: EventType;
    featureName?: string;
    environment?: string;
    enabled: boolean;
    variant?: string;
    context?: Context;
}
