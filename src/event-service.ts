import { IUnleashEvent } from './iunleash-event';

export default class EventService {
    private events: IUnleashEvent[] = [];

    constructor() {}

    public queue(event: IUnleashEvent): void {
        const decoratedEvent = { ...event, receivedTimestamp: new Date() };
        this.events.push(decoratedEvent);
    }
}
