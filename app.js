var express = require('express');
var bodyParser = require('body-parser');
var mongojs = require('./db');
var converter = require('hex2dec')
//var mongojs2 = require('./dbBeacon');

var db = mongojs.connect;
//var dbBeacon = mongojs.connect;

var app = express();
app.use(bodyParser.json());


//Get sensor data
app.get('/getsensor', function (req, res) {
  db.SensorData.find(function (err, docs) {
    //console.log(docs);
    res.send(docs);
  });
})

//Get beacon data
app.get('/getbeacon', function (req, res) {
  db.BeaconData.find(function (err, docs) {
    //console.log(docs);
    res.send(docs);
  });
})

//Get user by ID
app.get('/user/:id', function (req, res) {
  var id = parseInt(req.params.id);

  db.SensorData.find({
    id: id
  }, function (err, docs) {
    if (docs != null) {
      console.log('found', JSON.stringify(docs));
      res.json(docs);
    } else {
      res.send('sensor not found');
    }
  });
})

//Update sensor in body
app.post('/updatesensor', function (req, res) {
  var json=req.body
  let p_in=converter.hexToDec(json.DevEUI_uplink.payload_hex.slice(4,6))
  let p_out=converter.hexToDec(json.DevEUI_uplink.payload_hex.slice(10,12))
  let temp=converter.hexToDec(json.DevEUI_uplink.payload_hex.slice(16,20))/10
  let humit=converter.hexToDec(json.DevEUI_uplink.payload_hex.slice(-2))/2
  if(temp=='')temp=0
  if(humit=='')humit=0
  if(p_in=='')p_in=0
  if(p_out=='')p_out=0
  let time=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
 // console.log('Get from Api', req.body);

  db.SensorData.findAndModify({
    //query: {
      //id: req.body['id']
    //},
    update: {
      $set: {
        "P_IN":p_in,
        "P_OUT":p_out,
        "Timestamp":time,
        "Temperature":temp,
        "Humidity":humit
      }
    },
    new: true
  }, function (err, docs) {
    //console.log('Update Done', docs);
    res.json(docs);
  });
})

//Add sensor data
app.post('/addsensor', function (req, res) {
  var json = req.body;
  db.SensorData.insert(json, function (err, docs) {
    //console.log(docs);
    res.send(docs);
  });
})

//Add beacon data
app.post('/addbeacon', function (req, res) {
  var json = req.body;
  let p_in
  let p_out
  if(json.beacon.status=="enter"){
    p_in=1
    p_out=0
  }else if(json.beacon.status=="leave"){
    p_in=0
    p_out=1
  }else if(json.beacon.status=="test"){
    p_in=0
    p_out=0
  }
  let data={"Timestamp":json.beacon.datetime,"P_IN":p_in,"P_OUT":p_out}
  db.BeaconData.insert(data, function (err, docs) {
    //console.log(docs);
    res.send(docs);
  });
})

var server = app.listen(8000, function () {
  var port = server.address().port

  //console.log("RESTful API for TESA run at ", port)
})