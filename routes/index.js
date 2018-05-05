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

    //take all the input info from the front end
    var eventCon = {
        name: req.body.eventName,
        maxppl: req.body.player,
        date: req.body.timed,
        location: req.body.location
    };
    MongoClient.connect(url, function(err, db) {

        //insert event into the database
        if (err) throw err;
        var dbo = db.db("pickupEvents");
        var dbb = db.db("users");
        dbo.collection("events").insertOne(eventCon, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });

        //adds event to the list of events that the user is in
        event.push(eventCon);
        console.log(username);
        console.log(event);
        var myquery = { user: username };
        var newvalues = { $set: {user:username, name:event} };
        console.log(newvalues)

        //update username db with new event
        dbb.collection("username").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });

        //take user to myEvent page and display the user's created event
        res.render('myEvents', {myEvents:JSON.stringify(event)});
    });
});

/*GET JOIN PAGE*/
app.get('/join',function(req,res){

    MongoClient.connect(url, function(err, db) {

        var events = [];
        if (err) throw err;
        var dbo = db.db("pickupEvents");

        //take all events in database and send to the front end
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
        var joined= {
            name: req.body.joinEvent.name,
            maxppl: req.body.joinEvent.maxppl,
            date: req.body.joinEvent.date,
            location: req.body.joinEvent
        }
        event.push(joined); //does not quite work
        // ^main idea: get the info of event joined when user click join and log it
        //now only the location is pulled from the front end

        //updates the username database with the joined event and sends
        //event info to front end
        var myquery = { user: username };
        var newvalues = { $set: {user:username, name:JSON.stringify(event)} };
        console.log(JSON.stringify(event));
        console.log(newvalues)
        dbb.collection("username").updateOne(myquery, newvalues, function(err, rese) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
            res.render('myEvents', {myEvents:JSON.stringify(event)});
        });

    });
});

app.get('/myEvents',function(req,res){
    //render my Events page
    res.render('myEvents', {myEvents:JSON.stringify(event)});

});
module.exports = function(io) {
    var app = require('express');
    var router = app.Router();
    return router;
};

module.exports = app;
