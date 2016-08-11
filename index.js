'use strict';

var path = require('path');
var nodeify = require('nodeify');

var mongodb_prebuilt = require('mongodb-prebuilt');
var mongodb = require('mongodb');
var uid = require('uid');
var fs = require('fs');
var rmrf = require('rimraf');

function MongoInMemory (port) {

    this.databasePath = path.join(__dirname, '.data-' + uid());
    this.serverEventEmitter = null;
    this.host = '127.0.0.1';
    this.port = port || 27017;
    this.connections = {};

}

MongoInMemory.prototype.start = function (callback) {

	return nodeify(new Promise(function (resolve, reject) {

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

			if (error) {
				reject(error);
			} else {
				resolve({'host' : this.host, 'port' : this.port});
			}

	    });

	}.bind(this)), callback);

};

MongoInMemory.prototype.getMongouri = function (databaseName) {

    return "mongodb://" + this.host + ":" + this.port + "/" + databaseName;

};

MongoInMemory.prototype.getConnection = function (databaseName, callback) {

	return nodeify(new Promise(function (resolve, reject) {

	    if (this.connections[databaseName]) {

			resolve(this.connections[databaseName]);

	    } else {

	        return mongodb.connect(this.getMongouri(databaseName)).then(function(connection) {

				this.connections[databaseName] = connection;
				resolve(connection);

	        }.bind(this));

	    }

	}.bind(this)), callback);

};

MongoInMemory.prototype.getCollection = function (databaseName, collection, callback) {

	return nodeify(new Promise(function (resolve, reject) {

		return this.getConnection(databaseName).then(function (connection) {

			resolve(connection.collection(collection));

		});

	}.bind(this)), callback);

};

MongoInMemory.prototype.addDocument = function (databaseName, collectionName, document, callback) {

	return nodeify(new Promise(function (resolve, reject) {

	    return this.getCollection(databaseName, collectionName).then(function (collection) {

			collection.insertOne(document, function (error, result) {

				if (error) {

					reject(error);

				} else if (result.n === 0) {

					reject(new Error("no document was actually saved in the database"));

				} else {

					resolve(result.ops[0]);

				}

			});
	    });

	}.bind(this)), callback);

};

MongoInMemory.prototype.getDocument = function (databaseName, collectionName, documentId, callback) {

	return nodeify(new Promise(function (resolve, reject) {

		return this.getCollection(databaseName, collectionName).then(function (collection) {

			resolve(collection.findOne({"_id": documentId}));

		});

	}.bind(this)), callback);

};

MongoInMemory.prototype.addDirectoryOfCollections = function (databaseName, collectionsPath, callback) {

	return nodeify(new Promise(function (resolve, reject) {

	    this.getConnection(databaseName).then(function (connection) {

			let documentsAdded = [];

			let collections = fs.readdirSync(collectionsPath);

			for (let collection of collections) {

				var collectionPath = collectionsPath + "/" + collection;

				if (fs.lstatSync(collectionPath).isDirectory()) {

					let filenames = fs.readdirSync(collectionPath);

					for (let filename of filenames) {

						var documentPath = collectionPath + "/" + filename;
						let document = JSON.parse(fs.readFileSync(documentPath, 'utf8'));
						connection.collection(collection).insertOne(document);
						documentsAdded.push(collection + "/" + filename);

					}

				}

			}

			resolve(documentsAdded);

	    });

	}.bind(this)), callback);

};

MongoInMemory.prototype.stop = function (callback) {

	return nodeify(new Promise(function (resolve, reject) {

	    if (this.serverEventEmitter) {
	        this.serverEventEmitter.emit('mongoShutdown');
	        this.serverEventEmitter = null;
	    }

	    Object.keys(this.connections).map(databaseName => {

	        this.connections[databaseName].close();

	    });

	    rmrf.sync(this.databasePath);

	    process.nextTick(() => resolve(null));

	}.bind(this)), callback);

};

module.exports = MongoInMemory;
