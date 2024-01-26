import { createContext } from '../create-context';

test('should remove undefined properties', () => {
    const context = createContext({
        appName: undefined,
        userId: '123',
    });

    expect(context).not.toHaveProperty('appName');
    expect(context).toHaveProperty('userId');
    expect(context.userId).toBe('123');
});

test('should move rest props to properties', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
    });

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
    expect(context.properties?.region).toBe('eu');
    expect(context.properties?.tenantId).toBe('some-tenant');
});

test('should keep properties', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
        properties: {
            a: 'b',
            b: 'test',
        },
    });

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
    expect(context.properties?.region).toBe('eu');
    expect(context.properties?.tenantId).toBe('some-tenant');
    expect(context.properties?.a).toBe('b');
    expect(context.properties?.b).toBe('test');
});

test('will not blow up if properties is an array', () => {
    const context = createContext({
        userId: '123',
        tenantId: 'some-tenant',
        region: 'eu',
        properties: ['some'],
    });

    // console.log(context);

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
});

test('accepts current time as a context value', () => {
    const targetDate = new Date('2024-01-01T00:00:00.000Z');
    const context = createContext({
        currentTime: targetDate.toISOString(),
    });

    expect(context.currentTime).toStrictEqual(targetDate);
});

test('invalid time strings fall back to undefined currentTime', () => {
    const context = createContext({
        currentTime: 'its cute that you think this will parse',
    });

    expect(context).not.toHaveProperty('currentTime');
});

test('missing time current time falls back to undefined currentTime', () => {
    const context = createContext({
        userId: '123',
    });

    expect(context).not.toHaveProperty('currentTime');
});

test.skip('will not blow up if userId is an array', () => {
    const context = createContext({
        userId: ['123'],
        tenantId: 'some-tenant',
        region: 'eu',
        properties: ['some'],
    });

    // console.log(context);

    expect(context.userId).toBe('123');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('region');
});
