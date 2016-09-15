/**
 * Created by meganschoendorf on 9/13/16.
 */

import {assert} from 'chai';
import {init} from '../index';
import * as AWS from 'aws-sdk';
AWS.config.region = 'us-west-2';

describe("basic test", function() {
    it("connects", async function() {
        this.timeout(10000);
        let ravenClient = await init('test', 'test');
        assert.isDefined(ravenClient, "got a raven client");

        const result = ravenClient.captureMessage('test');
        console.log(result);

        // let result = await snowflake.raw(connection, "select * from identified_event where false", []);
        // assert.property(result, 'statement');
        // assert.property(result, 'rows');
        // assert.lengthOf(result.rows, 0);
    })
});