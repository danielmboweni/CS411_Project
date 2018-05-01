var express = require('express');
router = express.Router();
app = express();
config = require('./config')
http = require("http");
querystring = require('querystring');
var url = 'mongodb://localhost:27017/';
var MongoClient = require('mongodb').MongoClient;

const yelp = require('yelp-fusion');
const api_key = config.Yelp_Key;
const client = yelp.client(api_key);
var username;
var event = [];


/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/home',function (req,res) {
    res.render('home');
});

app.post('/home',function (req,res) {
    res.render('home');
});

/* GET home page. */
app.get('/', function(req, res) {
    res.render('index');
});

/*GET CREATE EVENT PAGE */
app.get('/createEvent', function(req, res){
    res.render('createevent');
});

/*GET AUTHORIZED PAGE*/
app.post('/authorized', function(req, res){
    username = req.body.username;
    console.log(username);
    var query = {user: username}
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("users");
        dbo.collection("username").findOne(query, function(err, result) {
            if (err){throw err}
            else if (result != null &&(result.user != null || result.user != undefined)){
                res.render('home');
            }
            else{
                dbo.collection("username").insertOne(query, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                });
                res.render('prefs');
            }
            db.close();
        });
    });
});

/*GET MAIN PAGE*/
app.get('/main', function(req, res){
    res.render('main');
});

/*YELP LOCATION SEARCH*/
app.post('/loc',function(req,res){
    var keyword = req.body.term;
    var loc = req.body.location;
    var searchRequest = {
        term: keyword,
        location: loc
    };

    var resultss = [];

    console.log(searchRequest);
    // noinspection JSAnnotator
    client.search(searchRequest).then(response => {
        r = response.jsonBody.businesses;

    //push results into an array
    for(i = 0; i< r.length-1; i ++){
        out = response.jsonBody.businesses[i];
        resultss.push({
            name: out.name,
            rating: out.rating,
            address: out.location.display_address,
            phone: out.display_phone,
            img: out.image_url
        });
    };

    console.log(resultss);

    res.render('createEvent', {result:JSON.stringify(resultss)});

});

});

/*CREATED EVENT CONFIRM*/
app.post('/myEvents',function(req,res){
    var eventCon = {
        name: req.body.eventName,
        maxppl: req.body.player,
        date: req.body.timed,
        location: req.body.location
    };
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("pickupEvents");
        var dbb = db.db("users");
        dbo.collection("events").insertOne(eventCon, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
        event.push(eventCon.name);
        console.log(username);
        console.log(event);
        var myquery = { user: username };
        var newvalues = { $set: {user:username, name:event} };
        console.log(newvalues)
        dbb.collection("username").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });

        res.render('home');
    });
});

/*GET JOIN PAGE*/
app.get('/join',function(req,res){

    MongoClient.connect(url, function(err, db) {
        var events = [];
        if (err) throw err;
        var dbo = db.db("pickupEvents");
        dbo.collection("events").find({}).toArray(function(err, r) {
            if (err) throw err;
            for(i = 0; i< r.length-1; i ++) {
                events.push(r[i]);

            };
            db.close();
            console.log(events);
            res.render('joinEvent', {eventList:JSON.stringify(events)});
        });
    });

});
app.post('/join',function(req,res){
    MongoClient.connect(url, function(err, db) {
        var dbb = db.db("users");
        event.push(req.body.joinEvent);
        console.log(event.toString());
        var myquery = { user: username };
        var newvalues = { $set: {user:username, name:event} };
        console.log(newvalues)
        dbb.collection("username").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });

        res.render('home');
    });
});

app.get('/myEvents',function(req,res){
    console.log("here: "+ event.toString());
    res.render('myEvents',{myEvents:event});
    // MongoClient.connect(url, function(err, db) {
    //     var dbo = db.db("pickupEvents");
    //     var dbb = db.db("users");
    //     var myEvent = [];
    //     var myquery = { user: username };
    //     var id = [];
    //     var name;
    //     dbb.collection("username").find(myquery, function(err, result) {
    //         id = result.id;
    //         name = result.name;
    //     });
    //
    //     res.render('myEvents');
    // });
});
module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    return router;
};

module.exports = app;
