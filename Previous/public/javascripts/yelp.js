
'use strict';

const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'mj09D1hJNRjXF_hmstbghBmvy61wjfhp9ACIE5P6SP0qy0QvjUthGt9w2XzvmtzkqIlGc34lKNrrIZlPFutzsmvOmiphaV93bnxh3DTBTJrqvcFxsOOy9g-JI8m2WnYx';

const searchRequest = {
    term:'Four Barrel Coffee',
    location: 'san francisco, ca'
};

const client = yelp.client(ds-kYWUPNaHyS6uIjcygyw);

client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
const prettyJson = JSON.stringify(firstResult, null, 4);
console.log(prettyJson);
}).catch(e => {
    console.log(e);
});