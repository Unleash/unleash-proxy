import { RequestHandler } from 'express';
import { hasBody, is } from 'type-is';

const DEFAULT_ACCEPTED_CONTENT_TYPE = 'application/json';

/**
 * Builds an express middleware checking the content-type header
 * returning 415 if the header is not either `application/json` or in the array
 * passed into the function of valid content-types
 * @param {String} acceptedContentTypes
 * @returns {function(Request, Response, NextFunction): void}
 */
export default function requireContentType(
    ...acceptedContentTypes: string[]
): RequestHandler {
    if (acceptedContentTypes.length === 0) {
        acceptedContentTypes.push(DEFAULT_ACCEPTED_CONTENT_TYPE);
    }
    return (req, res, next) => {
        const contentType = req.header('Content-Type');

        if (hasBody(req)) {
            if (!contentType) {
                req.headers['content-type'] = acceptedContentTypes[0];
                next();
            } else if (is(contentType, acceptedContentTypes)) {
                next();
            } else {
                res.status(415).end();
            }
        } else {
            next();
        }
    };
}
