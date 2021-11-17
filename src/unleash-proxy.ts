import { Request, Response, Router } from 'express';
import { Validator } from 'jsonschema';
import { createContext } from './create-context';
import { clientMetricsSchema } from './metrics-schema';
import { IProxyConfig } from './config';
import { IClient } from './client';
import { Logger } from './logger';
import { IUnleashEvent } from './iunleash-event';
import EventService from './event-service';
import * as unleashEventSchema from './unleash-event.json';

const NOT_READY =
    'Unleash Proxy has not connected to Unleash API and is not ready to accept requests yet.';

export default class UnleashProxy {
    private logger: Logger;

    private proxySecrets: string[];

    private client: IClient;

    private eventService: EventService;

    private validator: Validator;

    private ready = false;

    public middleware: Router;

    constructor(client: IClient, config: IProxyConfig) {
        this.logger = config.logger;
        this.proxySecrets = config.proxySecrets;
        this.client = client;
        this.eventService = config.eventService;
        this.validator = new Validator();

        if (client.isReady()) {
            this.setReady();
        }

        this.client.on('ready', () => {
            this.setReady();
        });

        const router = Router();
        this.middleware = router;

        // Routes
        router.get('/health', this.health.bind(this));
        router.get('/', this.getEnabledToggles.bind(this));
        router.post('/', this.lookupToggles.bind(this));
        router.post('/client/metrics', this.registerMetrics.bind(this));
        router.post('/events', this.handleEvents.bind(this));
    }

    private setReady() {
        this.ready = true;
        this.logger.info(
            'Successfully synchronized with Unleash API. Proxy is now ready to receive traffic.',
        );
    }

    setProxySecrets(proxySecrets: string[]): void {
        this.proxySecrets = proxySecrets;
    }

    getEnabledToggles(req: Request, res: Response): void {
        const apiToken = req.header('authorization');

        if (!this.ready) {
            res.status(503).send(NOT_READY);
        } else if (!apiToken || !this.proxySecrets.includes(apiToken)) {
            res.sendStatus(401);
        } else {
            const { query } = req;
            query.remoteAddress = query.remoteAddress || req.ip;
            const context = createContext(query);
            const toggles = this.client.getEnabledToggles(context);
            res.set('Cache-control', 'public, max-age=2');
            res.send({ toggles });
        }
    }

    lookupToggles(req: Request, res: Response): void {
        const apiToken = req.header('authorization');

        if (!this.ready) {
            res.status(503).send(NOT_READY);
        } else if (!apiToken || !this.proxySecrets.includes(apiToken)) {
            res.sendStatus(401);
        } else {
            const { context, toggles: toggleNames } = req.body;

            const toggles = this.client.getDefinedToggles(toggleNames, context);
            res.send(toggles);
        }
    }

    health(req: Request, res: Response): void {
        if (!this.ready) {
            res.status(503).send(NOT_READY);
        } else {
            res.send('ok');
        }
    }

    registerMetrics(req: Request, res: Response): void {
        const data = req.body;

        const { error, value } = clientMetricsSchema.validate(data);

        if (error) {
            this.logger.warn('Invalid metrics posted', error);
            res.status(400).json(error);
            return;
        }

        this.client.registerMetrics(value);
        res.sendStatus(200);
    }

    handleEvents(
        req: Request<any, IUnleashEvent, any, any>,
        res: Response,
    ): void {
        const event = req.body;

        this.logger.info('Event: ', event);

        try {
            const result = this.validator.validate(event, unleashEventSchema);
            if (result.errors.length > 0) {
                this.logger.error(result.errors);
                // Probably include validation error.
                res.sendStatus(400);
                return;
            }

            this.eventService.queue(event);
            res.sendStatus(202);
        } catch (err) {
            res.sendStatus(500);
        }
    }
}
