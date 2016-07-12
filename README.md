# MONGO-IN-MEMORY [![Build Status](https://travis-ci.org/giorgio-zamparelli/mongo-in-memory.png)](https://travis-ci.org/giorgio-zamparelli/mongo-in-memory)

Spins up a actual mongodb instance programmatically from node for testing or mocking during development.

Works on all platforms which is due to the awesome [mongodb-prebuilt](https://www.npmjs.com/package/mongodb-prebuilt) package.

## Installation
````
npm install mongo-in-memory
````

## Usage
Require mongo-in-memory, create an instance and start the server:

````javascript
const MongoInMemory = require('mongo-in-memory');

var port = 8000;
var mongoServerInstance = new MongoInMemory(port); //DEFAULT PORT is 27017

mongoServerInstance.start((error, config) => {

    if (error) {
        console.error(error);
    } else {

        //callback when server has started successfully

        console.log("HOST " + config.host);
        console.log("PORT " + config.port);

        var mongouri = mongoServerInstance.getMongouri("myDatabaseName");

    }

});

mongoServerInstance.stop((error) => {

    if (error) {
        console.error(error);
    } else {
        //callback when server has stopped successfully
    }

});
````

## Methods and Properties

### constructor([PORT])
If no `PORT` is specified the default value is 27017

### mongoServerInstance.start(callback)
Starts the mongo instance
The callback returns a config object with attributes host and port.

### mongoServerInstance.stop(callback)
Stops the mongo instance.

### mongoServerInstance.mongodb
Exposes the version of the official native mongodb driver, gives the possibility to override it.

## Testing with Mocha

This is an example for a simple test with `mockgo` in mocha.

````javascript
var async = require('async');
var expect = require('chai').expect;

var MongoInMemory = require('./');
var mongodb = require('mongodb');

describe('mock-in-memory', function() {

    this.timeout(0);

    describe('connect to server', () => {

        var mongoInMemory;

        before(done => {

            mongoInMemory = new MongoInMemory(8000);
            mongoInMemory.start((error, config) => {

                done();

            });

        })

        after(done => {

            mongoInMemory.stop((error) => {

                expect(error).to.be.null
                done()

            });

        })

        it('should open a connection with a dummy database name', done => {

            mongodb.connect(mongoInMemory.getMongouri("testDatabaseName"), function(error, db) {

                if (error) {
                    console.log(error);
                } else {
                    //console.log("Connected correctly to server");
                }

                db.close();

                done();

            });

        })

    })

})

````


# License
The MIT License (MIT)

Copyright (c) 2016 Manuel Ernst

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
