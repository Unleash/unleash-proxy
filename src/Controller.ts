import { Request as ExpressRequest } from 'express';
import { Controller, Get, Request, Response, Route, Security } from 'tsoa';

type Variant = {
    payload?: string;
    name: string;
    enabled: boolean;
};

type Feature = {
    name: string;
    enabled: boolean;
    variant: Variant;
};

/**
 This is a model description.
 It describes the features response model.
*/
type FeaturesResponse = {
    /**
   The list of features that are enabled with the given context.
  */
    toggles: Feature[];
};

type CustomValidationError = {
    message: string;
    context: any;
};

@Route('/proxy2')
export class MainController extends Controller {
    /**
     * A very long, verbose, wordy, long-winded, tedious, verbacious, tautological,
     * profuse, expansive, enthusiastic, redundant, flowery, eloquent, articulate,
     * loquacious, garrulous, chatty, extended, babbling description.
     * @summary A concise summary.
     */
    @Get('')
    @Response<CustomValidationError>(
        503,
        'The Unleash Proxy  is not ready to accept requests yet.',
    )
    @Response(
        401,
        'Unauthorized; the client key you provided is not valid for this instance.',
    )
    public async getToggles(
        @Request() req: ExpressRequest,
    ): Promise<FeaturesResponse | string | void> {
        const apiToken = req.header('authorization');

        if (false) {
            this.setStatus(503);
            return 'Not ready';
        } else if (!apiToken || !['mykey'].includes(apiToken)) {
            this.setStatus(401);
        } else {
            const { query } = req;
            query.remoteAddress = query.remoteAddress || req.ip;
            // const context = createContext(query);
            // const toggles = this.client.getEnabledToggles(context);
            this.setHeader('Cache-control', 'public, max-age=2');
            return { toggles: [] };
        }
    }
    @Get('some/path')
    @Response<CustomValidationError>(
        503,
        'The Unleash Proxy  is not ready to accept requests yet.',
    )
    @Response(
        401,
        'Unauthorized; the client key you provided is not valid for this instance.',
    )
    public async getToggles2(
        @Request() req: ExpressRequest,
    ): Promise<FeaturesResponse | string | void> {
        const apiToken = req.header('authorization');

        if (false) {
            this.setStatus(503);
            return 'Not ready';
        } else if (!apiToken || !['mykey'].includes(apiToken)) {
            this.setStatus(401);
        } else {
            const { query } = req;
            query.remoteAddress = query.remoteAddress || req.ip;
            // const context = createContext(query);
            // const toggles = this.client.getEnabledToggles(context);
            this.setHeader('Cache-control', 'public, max-age=2');
            return { toggles: [] };
        }
    }
}
