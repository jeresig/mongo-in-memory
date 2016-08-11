'use strict';

const expect = require('chai').expect;

var MongoInMemory = require('./../');
var mongodb = require('mongodb');

describe('mock-in-memory', function() {

    this.timeout(0);

    var mongoInMemory;
    var port = 8000;
    var databaseName = "testDatabaseName";

    before(done => {

        mongoInMemory = new MongoInMemory(port);
        mongoInMemory.start((error, config) => {

            expect(error).to.be.null;
            //console.log(config.host);
            //console.log(config.port);

            done();

        });

    })

    after(done => {

        mongoInMemory.stop((error) => {

            expect(error).to.be.null;
            done();

        });

    })

    it('getMongouri() should return a valid mongouri', () => {

        let mongouri = mongoInMemory.getMongouri(databaseName);
        expect(mongouri).to.exist;

        expect("mongodb://127.0.0.1:" + port + "/" + databaseName).to.be.equal(mongouri);

    })

    it('getConnection() should return a valid mongodb driver connection', done => {

        mongoInMemory.getConnection(databaseName, function(error, connection) {

            expect(error).to.be.null;
            expect(connection).to.exist;

            done();

        });

    })

	it('getCollection() should return a valid mongodb driver connection', done => {

		var collection = "airplanes";

        mongoInMemory.getCollection(databaseName, collection, function(error, collection) {

            expect(error).to.be.null;
            expect(collection).to.exist;

            done();

        });

    })

    it('addDocument() should add a document successfully', done => {

        var document = { "manufacturer" : "Boeing", "model" : "747", "color": "white" };

        var collection = "airplanes";

        mongoInMemory.addDocument(databaseName, collection, document, function(error, documentActual) {

            expect(error).to.be.null;
            expect(document).to.exist;
            expect(document._id).to.exist;

			mongoInMemory.getDocument(databaseName, collection, document._id, function(error, documentActual) {

				expect(error).to.be.null;
	            expect(documentActual).to.exist;

				done();

	        });

        });

    })

    it('addDirectoryOfCollections() should add stubs documents to the correct collections', done => {

        let collectionsPath = "./tests/stubs-mongo-collections";
        let toyotaPriusBlue = require("./stubs-mongo-collections/cars/toyota-prius-blue.json");
        let piaggioVespaWhite = require("./stubs-mongo-collections/motorbikes/piaggio-vespa-white.json");

        mongoInMemory.addDirectoryOfCollections(databaseName, collectionsPath, function(error, documentsAdded) {

            expect(error).to.be.null;
            expect(documentsAdded.length).to.equal(2);

            mongoInMemory.getConnection(databaseName, function(error, connection) {

                expect(error).to.be.null;
                expect(connection).to.exist;

                connection.collection("cars").findOne({"_id" : toyotaPriusBlue._id}, function (error, toyotaPriusBlueActual) {

                    expect(error).to.be.null;
                    expect(toyotaPriusBlueActual).to.exist;
                    expect(toyotaPriusBlue).to.be.deep.equal(toyotaPriusBlueActual);

                    connection.collection("motorbikes").findOne({"_id" : piaggioVespaWhite._id}, function (error, piaggioVespaWhiteActual) {

                        expect(error).to.be.null;
                        expect(piaggioVespaWhiteActual).to.exist;
                        expect(piaggioVespaWhite).to.be.deep.equal(piaggioVespaWhiteActual);

                        done();

                    });

                });

            });

        });

    })

})
