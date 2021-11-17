import got from 'got';
import { IUnleashEvent } from './iunleash-event';
import { Logger } from './logger';

const rudderTransform = (e: IUnleashEvent) => ({
    userId: e.context?.userId,
    type: 'track',
    event: e.eventType,
    context: e.context,
    timestamp: e.receivedTimestamp,
});

export default class EventService {
    private logger: Logger;

    private events: IUnleashEvent[] = [];

    private pushUrl: string;

    constructor(
        logger: Logger,
        url = 'https://getunleasharyw.dataplane.rudderstack.com//v1/batch',
    ) {
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

            const content = {
                batch: eventsToSend.map((e) => rudderTransform(e)),
            };

            console.log(content);

            try {
                // Single destination: Rudder stack
                await got.post(this.pushUrl, {
                    json: content,
                    headers: {
                        Authorization:
                            'Basic MjEyc3pmVHdvWkh5aXZzQjQxRVNCTHJoSmFUOg==',
                    },
                });
            } catch (e) {
                console.error(e);
            }
        }
    }
}
