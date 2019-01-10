var mongojs = require('mongojs');

var databaseUrl = 'mongodb://localhost/Data';
var collections = ['BeaconData'];
//var option = {'author':{'user':'wu','password':'1234'}}

var connect = mongojs(databaseUrl);

module.exports = {
    connect: connect
};