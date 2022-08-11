import { Context } from 'unleash-client';

export type ContextEnricher = (context: Context) => Promise<Context>;

export function enrichContext(
    contextEnrichers: ContextEnricher[],
    context: Context,
): Promise<Context> {
    return contextEnrichers.reduce(
        (previous, current) => previous.then(current),
        Promise.resolve(context),
    );
}
