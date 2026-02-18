import type { Request, Response } from 'express';
import requireContentType from '../content-type-checker';

const mockRequest =
    (transferEncoding: string | undefined) =>
    (contentType?: string): Request => {
        const headers = {
            'content-type': contentType,
            'transfer-encoding': transferEncoding,
        };

        // @ts-expect-error (It's not a real request)
        return {
            header: (name: string) =>
                //@ts-expect-error (yes, this may fail)
                headers[name.toLowerCase()],
            headers,
        };
    };

const mockRequestWithBody = mockRequest('chunked');

const mockRequestWithoutBody = mockRequest(undefined);

const returns415: (t: jest.Mock) => Response = (t) => ({
    // @ts-expect-error
    status: (code) => {
        expect(415).toBe(code);
        return {
            end: t,
        };
    },
});

const expectNoCall: (t: jest.Mock) => Response = (t) => ({
    status: () => ({
        // @ts-expect-error
        end: () => expect(t).toHaveBeenCalledTimes(0),
    }),
});

describe('Content-type checker middleware', () => {
    test('should by default only support application/json', () => {
        const middleware = requireContentType();
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequestWithBody('application/json'),
            expectNoCall(fail),
            t,
        );
        middleware(mockRequestWithBody('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(2);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should support application/json with charset by default', () => {
        const middleware = requireContentType();
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequestWithBody('application/json; charset=UTF-8'),
            expectNoCall(fail),
            t,
        );
        middleware(mockRequestWithBody('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(2);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should allow adding custom supported types', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequestWithBody('application/yaml'),
            expectNoCall(fail),
            t,
        );
        middleware(mockRequestWithBody('text/html'), returns415(t), fail);
        middleware(mockRequestWithBody('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(3);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('does not support default support types if you provide your own', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequestWithBody('application/json'),
            returns415(t),
            fail,
        );
        expect(t).toHaveBeenCalledTimes(1);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('Should accept multiple content-types', () => {
        const middleware = requireContentType(
            'application/json',
            'application/yaml',
            'form/multipart',
        );
        const fail = jest.fn();
        const succeed = jest.fn();
        middleware(
            mockRequestWithBody('application/json'),
            expectNoCall(fail),
            succeed,
        );
        middleware(
            mockRequestWithBody('application/yaml'),
            expectNoCall(fail),
            succeed,
        );
        middleware(
            mockRequestWithBody('form/multipart'),
            expectNoCall(fail),
            succeed,
        );
        middleware(
            mockRequestWithBody('text/plain'),
            returns415(succeed),
            fail,
        );
        expect(succeed).toHaveBeenCalledTimes(4);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should not stop requests that have no body', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequestWithBody('application/json'),
            returns415(t),
            fail,
        );
        expect(t).toHaveBeenCalledTimes(1);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    describe('add default content-types to requests with bodies but no content-type', () => {
        test('should add the default content type if no custom types are provided', () => {
            const middleware = requireContentType();
            const request = mockRequestWithBody();
            const t = jest.fn();
            const fail = jest.fn();
            middleware(request, expectNoCall(fail), t);
            expect(t).toHaveBeenCalledTimes(1);
            expect(request.header('content-type')).toEqual('application/json');
        });

        test('does not add default content type if there is no body', () => {
            const middleware = requireContentType();
            const request = mockRequestWithoutBody();
            const t = jest.fn();
            const fail = jest.fn();
            middleware(request, expectNoCall(fail), t);
            expect(t).toHaveBeenCalledTimes(1);
            expect(request.header('content-type')).toEqual(undefined);
        });

        test('should add the first custom content type if provided', () => {
            const middleware = requireContentType(
                'application/yaml',
                'application/xml',
                'application/x-www-form-urlencoded',
            );

            const request = mockRequestWithBody();
            const t = jest.fn();
            const fail = jest.fn();
            middleware(request, expectNoCall(fail), t);
            expect(t).toHaveBeenCalledTimes(1);
            expect(request.header('content-type')).toEqual('application/yaml');
        });

        test('does not change the content-type if the request already has one', () => {
            const middleware = requireContentType(
                'application/json',
                'application/yaml',
            );
            const request = mockRequestWithBody('application/yaml');
            const t = jest.fn();
            const fail = jest.fn();
            middleware(request, expectNoCall(fail), t);
            expect(t).toHaveBeenCalledTimes(1);
            expect(request.header('content-type')).toEqual('application/yaml');
        });
    });
});
