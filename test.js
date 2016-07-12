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

                //console.log(config.host);
                //console.log(config.port);

                done();

            });

        })

        after(done => {

            mongoInMemory.stop((error) => {

                expect(error).to.be.null;
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
