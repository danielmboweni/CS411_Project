var express = require('express');
    router = express.Router();
    app = express();

const yelp = require('yelp-fusion');
const api_key = 'mj09D1hJNRjXF_hmstbghBmvy61wjfhp9ACIE5P6SP0qy0QvjUthGt9w2XzvmtzkqIlGc34lKNrrIZlPFutzsmvOmiphaV93bnxh3DTBTJrqvcFxsOOy9g-JI8m2WnYx';
const client = yelp.client(api_key);

var firstResult;

/* GET home page. */
app.get('/', function(req, res) {

    res.render('index');
});

app.post('/',function(req,res){
    var keyword = req.body.term;
    var loc = req.body.location;
    var searchRequest = {
        term: keyword,
        location: loc
    }

    var firstResult = {
        name: "",
        rating: "",
        address: "",
        phone: ""
    };
    console.log(searchRequest);
    // noinspection JSAnnotator
    client.search(searchRequest).then(response => {
        console.log("Here", response);

    r = response.jsonBody.businesses[0];

    console.log(r);
    firstResult.name = r.name;
    firstResult.address = r.location.display_address;
    firstResult.phone = r.display_phone;
    firstResult.rating = r.rating;
    const prettyJson = JSON.stringify(firstResult, null, 4);

    res.render('index', {
        term: searchRequest.term,
        name: firstResult.name,
        rating: firstResult.rating,
        address: firstResult.address,
        phone: firstResult.phone
        // address: firstResult.location.display_address,
        // phone: firstResult.display_phone
    });
    // console.log(prettyJson);
});


    console.log("First result", firstResult);

});

module.exports = app;
