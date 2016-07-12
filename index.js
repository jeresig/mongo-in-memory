const path = require('path');

const mongodb_prebuilt = require('mongodb-prebuilt');
const uid = require('uid');
const fs = require('fs');
const rmrf = require('rimraf');

function MongoInMemory (port) {

    this.databasePath = path.join(__dirname, '.data-' + uid());
    this.serverEventEmitter = null;
    this.host = '127.0.0.1';
    this.port = port || 27017;

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

        callback(error, { 'host' : this.host, 'port' : this.port});

    });

};

MongoInMemory.prototype.getMongouri = function (databaseName) {

    return "mongodb://" + this.host + ":" + this.port + "/" + databaseName;

};

MongoInMemory.prototype.stop = function (callback) {

    if (this.serverEventEmitter) {
        this.serverEventEmitter.emit('mongoShutdown');
        this.serverEventEmitter = null;
    }

    rmrf.sync(this.databasePath);

    process.nextTick(() => callback(null));

};

module.exports = MongoInMemory;
