'use strict';

const path = require('path');

const mongodb_prebuilt = require('mongodb-prebuilt');
const mongodb = require('mongodb');
const uid = require('uid');
const fs = require('fs');
const rmrf = require('rimraf');

function MongoInMemory (port) {

    this.databasePath = path.join(__dirname, '.data-' + uid());
    this.serverEventEmitter = null;
    this.host = '127.0.0.1';
    this.port = port || 27017;
    this.connections = {};

}

MongoInMemory.prototype.start = function (callback) {

    fs.mkdirSync(this.databasePath);

    this.serverEventEmitter = mongodb_prebuilt.start_server({

        args: {
            storageEngine: 'ephemeralForTest',
            bind_ip: this.host,
            port: this.port,
            dbpath: this.databasePath
        },
        auto_shutdown: true

    }, (error) => {

        callback(error || null, { 'host' : this.host, 'port' : this.port});

    });

};

MongoInMemory.prototype.getMongouri = function (databaseName) {

    return "mongodb://" + this.host + ":" + this.port + "/" + databaseName;

};

MongoInMemory.prototype.getConnection = function (databaseName, callback) {

    if (this.connections[databaseName]) {

        callback(null, this.connections[databaseName]);

    } else {

        mongodb.connect(this.getMongouri(databaseName), function(error, connection) {

            if (!error) {
                this.connections[databaseName] = connection;
            }

            callback(error, connection);

        }.bind(this));

    }

};

MongoInMemory.prototype.addDocument = function (databaseName, collection, document, callback) {

    this.getConnection(databaseName, function (error, connection) {

        if (error) {

            callback(error, null);

        } else {

            connection.collection(collection).insertOne(document, function (error, result) {

                if (error) {

                    callback(error, null);

                } else if (result.n === 0) {

                    callback(new Error("no document was actually saved in the database"), null);

                } else {

                    callback(null, result.ops[0]);

                }

            });

        }

    });

};

MongoInMemory.prototype.stop = function (callback) {

    if (this.serverEventEmitter) {
        this.serverEventEmitter.emit('mongoShutdown');
        this.serverEventEmitter = null;
    }

    Object.keys(this.connections).map(databaseName => {

        this.connections[databaseName].close();

    });

    rmrf.sync(this.databasePath);

    process.nextTick(() => callback(null));

};

module.exports = MongoInMemory;
