import { NextFunction, Request, Response } from 'express';
import { createContext } from './create-context';
import { ContextEnricher, enrichContext } from './enrich-context';

const POST = 'POST';
const GET = 'GET';

export const createContexMiddleware: Function =
    (contextEnrichers: ContextEnricher[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        let context;
        if (req.method === GET) {
            context = req.query || {};
        } else if (req.method === POST) {
            context = req.body.context || {};
        }
        context.remoteAddress = context.remoteAddress || req.ip;
        try {
            res.locals.context = await enrichContext(
                contextEnrichers,
                createContext(context),
            );
            next();
        } catch (err) {
            next(err); // or res.status(500).send("Failed to process the context");
        }
        return;
    };
