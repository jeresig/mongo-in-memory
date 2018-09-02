const path = require("path");
const nodeify = require("nodeify");

const { MongodHelper } = require("mongodb-prebuilt");
const mongodb = require("mongodb").MongoClient;
const uid = require("uid");
const fs = require("fs");
const rmrf = require("rimraf");

function MongoInMemory(port) {
    this.databasePath = path.join(__dirname, `.data-${uid()}`);
    this.serverEventEmitter = null;
    this.host = "127.0.0.1";
    this.port = port || 27017;
    this.connections = {};
}

MongoInMemory.prototype.start = function(callback) {
    return nodeify(
        new Promise((resolve, reject) => {
            fs.mkdirSync(this.databasePath);

            const helper = new MongodHelper([
                "--port",
                this.port,
                "--bind_ip",
                this.host,
                "--storageEngine",
                "ephemeralForTest",
                "--dbpath",
                this.databasePath,
            ]);

            helper
                .run()
                .then(() => {
                    resolve({ host: this.host, port: this.port });
                })
                .catch(reject);
        }),
        callback
    );
};

MongoInMemory.prototype.getMongouri = function(databaseName) {
    return `mongodb://${this.host}:${this.port}/${databaseName}`;
};

MongoInMemory.prototype.getConnection = function(databaseName, callback) {
    return nodeify(
        new Promise((resolve, reject) => {
            if (this.connections[databaseName]) {
                resolve(this.connections[databaseName]);
            } else {
                return mongodb
                    .connect(
                        this.getMongouri(databaseName),
                        {
                            useNewUrlParser: true,
                        }
                    )
                    .then(connection => {
                        this.connections[databaseName] = connection;
                        resolve(connection);
                    });
            }
        }),
        callback
    );
};

MongoInMemory.prototype.getCollection = function(
    databaseName,
    collection,
    callback
) {
    return nodeify(
        new Promise((resolve, reject) => {
            return this.getConnection(databaseName).then(connection => {
                resolve(connection.db(databaseName).collection(collection));
            });
        }),
        callback
    );
};

MongoInMemory.prototype.addDocument = function(
    databaseName,
    collectionName,
    document,
    callback
) {
    return nodeify(
        new Promise((resolve, reject) => {
            return this.getCollection(databaseName, collectionName).then(
                collection => {
                    collection.insertOne(document, (error, result) => {
                        if (error) {
                            reject(error);
                        } else if (result.n === 0) {
                            reject(
                                new Error("no document was actually saved in the database")
                            );
                        } else {
                            resolve(result.ops[0]);
                        }
                    });
                }
            );
        }),
        callback
    );
};

MongoInMemory.prototype.getDocument = function(
    databaseName,
    collectionName,
    documentId,
    callback
) {
    return nodeify(
        new Promise((resolve, reject) => {
            return this.getCollection(databaseName, collectionName).then(
                collection => {
                    resolve(collection.findOne({ _id: documentId }));
                }
            );
        }),
        callback
    );
};

MongoInMemory.prototype.addDirectoryOfCollections = function(
    databaseName,
    collectionsPath,
    callback
) {
    return nodeify(
        new Promise((resolve, reject) => {
            this.getConnection(databaseName).then(connection => {
                const documentsAdded = [];

                const collections = fs.readdirSync(collectionsPath);

                for (const collection of collections) {
                    const collectionPath = `${collectionsPath}/${collection}`;

                    if (fs.lstatSync(collectionPath).isDirectory()) {
                        const filenames = fs.readdirSync(collectionPath);

                        for (const filename of filenames) {
                            const documentPath = `${collectionPath}/${filename}`;
                            const document = JSON.parse(
                                fs.readFileSync(documentPath, "utf8")
                            );
                            connection
                                .db(databaseName)
                                .collection(collection)
                                .insertOne(document);
                            documentsAdded.push(`${collection}/${filename}`);
                        }
                    }
                }

                resolve(documentsAdded);
            });
        }),
        callback
    );
};

MongoInMemory.prototype.stop = function(callback) {
    return nodeify(
        new Promise((resolve, reject) => {
            Object.keys(this.connections).map(databaseName => {
                this.connections[databaseName].close();
            });

            rmrf.sync(this.databasePath);

            process.nextTick(() => resolve(null));
        }),
        callback
    );
};

module.exports = MongoInMemory;
