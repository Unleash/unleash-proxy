/* eslint-disable @typescript-eslint/no-unused-vars */
const { Strategy } = require('unleash-client');

class TestStrat extends Strategy {
    constructor() {
        super('FromFile');
    }

    isEnabled(parameters, context) {
        // do something cool with params and context.
        return true;
    }
}

module.exports = [new TestStrat()];
