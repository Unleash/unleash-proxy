import got from 'got';
import { IUnleashEvent } from './iunleash-event';
import { Logger } from './logger';

export default class EventService {
    private logger: Logger;

    private events: IUnleashEvent[] = [];

    private pushUrl: string;

    constructor(logger: Logger, url = 'http://localhost:3001') {
        this.pushUrl = url;
        this.logger = logger;

        setInterval(async () => {
            this.sendEvents();
        }, 500);
    }

    public queue(events: IUnleashEvent[]): void {
        const eventsWithTs = events.map((e) => ({
            ...e,
            receivedTimestamp: new Date(),
        }));

        this.events.push(...eventsWithTs);
    }

    async sendEvents(): Promise<void> {
        if (this.events.length > 0) {
            const eventsToSend = this.events.splice(0, this.events.length);

            try {
                // Single destination
                await got.post(this.pushUrl, {
                    json: eventsToSend.map((e) => e),
                });
            } catch (e) {
                console.error('Could not send events');
            }
        }
    }
}
