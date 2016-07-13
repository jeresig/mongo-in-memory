'use strict';

const should = require('chai').should();
const expect = require('chai').expect;

var MongoInMemory = require('./');
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
        should.exist(mongouri);

        expect("mongodb://127.0.0.1:" + port + "/" + databaseName).to.be.equal(mongouri);

    })

    it('getConnection() should return a valid mongodb driver connection', done => {

        mongoInMemory.getConnection(databaseName, function(error, connection) {

            expect(error).to.be.null;
            should.exist(connection);

            done();

        });

    })

    it('addDocument() should add a document successfully', done => {

        var document = {"name" : "Toyota Prius", "color": "blue"};
        var collection = "cars";

        mongoInMemory.addDocument(databaseName, collection, document, function(error, documentActual) {

            expect(error).to.be.null;
            should.exist(document);
            should.exist(document._id);

            done();

        });

    })

})
