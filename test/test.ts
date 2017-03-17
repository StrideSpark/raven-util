/**
 * Created by meganschoendorf on 9/13/16.
 */

import { assert } from 'chai';
import { init } from '../src';
import * as AWS from 'aws-sdk';
AWS.config.region = 'us-west-2';

describe("basic test", function () {
    it("connects", async function () {
        this.timeout(10000);
        process.env.BUILD_HASH = 'test';

        let ravenClient = await init('test', 'test');
        assert.isDefined(ravenClient, "got a raven client");

        const result = await ravenClient.captureMessagePromise('test');
        assert.typeOf(result, 'string')

        const result2 = await ravenClient.captureExceptionPromise(new Error('test'), { foo: 1, tags: { bar: 2 } });
        assert.typeOf(result2, 'string')
    })
});