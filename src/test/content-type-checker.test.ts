import { Request, Response } from 'express';
import requireContentType from '../content-type-checker';

const mockRequest: (contentType: string) => Request = (contentType) => ({
    // @ts-ignore
    header: (name) => {
        if (name === 'Content-Type') {
            return contentType;
        }
        return '';
    },
});

const returns415: (t: jest.Mock) => Response = (t) => ({
    // @ts-ignore
    status: (code) => {
        expect(415).toBe(code);
        return {
            end: t,
        };
    },
});

const expectNoCall: (t: jest.Mock) => Response = (t) => ({
    // @ts-ignore
    status: () => ({
        // @ts-ignore
        end: () => expect(t).toHaveBeenCalledTimes(0),
    }),
});

describe('Content-type checker middleware', () => {
    test('should by default only support application/json', () => {
        const middleware = requireContentType();
        const t = jest.fn();
        const fail = jest.fn();
        middleware(mockRequest('application/json'), expectNoCall(fail), t);
        middleware(mockRequest('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(2);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should support application/json with charset by default', () => {
        const middleware = requireContentType();
        const t = jest.fn();
        const fail = jest.fn();
        middleware(
            mockRequest('application/json; charset=UTF-8'),
            expectNoCall(fail),
            t,
        );
        middleware(mockRequest('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(2);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should allow adding custom supported types', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(mockRequest('application/yaml'), expectNoCall(fail), t);
        middleware(mockRequest('text/html'), returns415(t), fail);
        middleware(mockRequest('text/plain'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(3);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('does not support default support types if you provide your own', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(mockRequest('application/json'), returns415(t), fail);
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
            mockRequest('application/json'),
            expectNoCall(fail),
            succeed,
        );
        middleware(
            mockRequest('application/yaml'),
            expectNoCall(fail),
            succeed,
        );
        middleware(mockRequest('form/multipart'), expectNoCall(fail), succeed);
        middleware(mockRequest('text/plain'), returns415(succeed), fail);
        expect(succeed).toHaveBeenCalledTimes(4);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    test('should not stop requests that have no body', () => {
        const middleware = requireContentType('application/yaml');
        const t = jest.fn();
        const fail = jest.fn();
        middleware(mockRequest('application/json'), returns415(t), fail);
        expect(t).toHaveBeenCalledTimes(1);
        expect(fail).toHaveBeenCalledTimes(0);
    });

    // describe('add default content-types to requests with bodies but no content-type', () => {
    //     test('should add the default content type if no custom types are provided', () => {
    //         const middleware = requireContentType();
    //         const t = jest.fn();
    //         const fail = jest.fn();
    //         middleware(mockRequest('application/json'), returns415(t), fail);
    //         expect(t).toHaveBeenCalledTimes(1);
    //         expect(fail).toHaveBeenCalledTimes(0);
    //     });

    //     test('should add the first custom content type if provided', () => {
    //         const middleware = requireContentType(
    //             'application/yaml',
    //             'application/xml',
    //             'application/x-www-form-urlencoded',
    //         );

    //         const requestObject = mockRequest(undefined);
    //         const t = jest.fn();
    //         const fail = jest.fn();
    //         middleware(mockRequest('application/json'), returns415(t), fail);
    //         expect(t).toHaveBeenCalledTimes(1);
    //         expect(fail).toHaveBeenCalledTimes(0);
    //         expect(requestObject.headers['Content-Type']).toEqual(
    //             'application/yaml',
    //         );
    //     });
    // });
});
