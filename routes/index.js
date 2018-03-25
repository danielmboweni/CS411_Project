var express = require('express');
var router = express.Router();
const request = require("request");


/* GET home page. */
router.get('/', (req, res) => {
    res.sendFile('index.html', {
    root: './views'
});
});

router.post('/', function(req,res,next){
  const options = {
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/search',
  };
    request(options, function (error, response, body){
      if (error) throw new Error(error);

      console.log(body);
      res.render('index',{result: JSON.parse(body)});
    });
  
});


module.exports = router;
