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

All methods accept callbacks and return promises too.

### constructor([PORT])
If no `PORT` is specified the default value is 27017

### mongoServerInstance.start(function callback (error, config))
Starts the mongo instance
The callback returns a config object with attributes host and port.

### mongoServerInstance.stop(function callback (error))
Stops the mongo instance.

### mongoServerInstance.getMongouri(databaseName)
Returns a string containing the mongouri to a mongo database.
This should be called only after successful call to mongoServerInstance.start()

### mongoServerInstance.getConnection(databaseName, function callback (error, connection))
Returns a connection object from [the official MongoDB driver for Node.js](https://www.npmjs.com/package/mongodb)

### mongoServerInstance.addDocument(databaseName, collectionName, documentObjectToAdd, function callback (error, documentObjectAdded)))
Adds a document to a collection of a database.

### mongoServerInstance.addDirectoryOfCollections(databaseName, collectionsPath, callback, function callback (error, documentsAdded)))
Adds an entire directory to the database. The directory must contains sub-directories named after each collection name. Each collection directory must then contain the documents that must be added. Check out the test named addDirectoryOfCollections()  whithin the file [tests/test.js](https://github.com/giorgio-zamparelli/mongo-in-memory/blob/master/tests/test.js).

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
