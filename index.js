var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var assert = require('assert');
var express = require('express');
    router = express.Router();
    app = express();

const yelp = require('yelp-fusion');
const api_key = 'mj09D1hJNRjXF_hmstbghBmvy61wjfhp9ACIE5P6SP0qy0QvjUthGt9w2XzvmtzkqIlGc34lKNrrIZlPFutzsmvOmiphaV93bnxh3DTBTJrqvcFxsOOy9g-JI8m2WnYx';
const client = yelp.client(api_key);

/* GET home page. */
app.get('/', function(req, res) {

    res.render('index');
});

app.post('/',function(req,res){
    var keyword = req.body.term;
    var loc = req.body.location;
    var searchRequest = {
        term: keyword,
        location: loc,
    }

    var output = {
        name: "",
        rating: "",
        address: "",
        phone: ""
    };

    var insertObj = {
        key: keyword,
        loct:loc,
        result: output
    };

    console.log(searchRequest);
    // noinspection JSAnnotator
    client.search(searchRequest).then(response => {
        console.log("Here", response);

    r = response.jsonBody.businesses[0];

    console.log(r);
    output.name = r.name;
    output.address = r.location.display_address;
    output.phone = r.display_phone;
    output.rating = r.rating;
    const prettyJson = JSON.stringify(output, null, 4);

    MongoClient.connect(url,function (err,db) {
        assert.equal(null, err);
        var dbo = db.db("pickupdb");
        dbo.collection('search_results').insertOne(insertObj, function(err,res){
        assert.equal(null, err);
        db.close();
          });
    });

    res.render('index', {
        term: searchRequest.term,
        name: output.name,
        address: output.address,
        phone: output.phone

    });

});


    console.log("First result", output);

});
//Database connections


module.exports = app;
