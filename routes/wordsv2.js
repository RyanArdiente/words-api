var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('databases/words.sqlite');
db.run("PRAGMA case_sensitive_like = true");
var Twitter = require('twitter');
var credentials = require("../.credentials.js");
var twitParams = credentials.twitParams;
var twitClient = new Twitter(credentials.twitCredentials);
twitClient.get('statuses/user_timeline', twitParams, function(error, tweets, response){
  if (!error) {
    console.log(tweets);
  }
});



router.get('/', function(req, res, next) {
var count = 0;
db.get("SELECT COUNT(*) AS tot FROM words", function(err,row){
var respText = "Words API: " + row.tot + " words online.";
res.send(respText);
});
 });



// We'll implement our API here...
router.get('/count/:abbrev/searchsensitivity/:ssVal', function(req, res, next) {
var abbrev = req.params.abbrev;
var searchsensitivity = ((req.params.ssVal).trim() == 'true') || false;
if (! (typeof searchsensitivity === 'boolean')){
  searchsensitivity = false;
}
db.run("PRAGMA case_sensitive_like = " + searchsensitivity);
var alen = abbrev.length;
var dataArray = [];
var sql = "SELECT substr(word,1," + alen + "+1) AS abbr, "
+" count(*) AS wordcount FROM words " +" WHERE word LIKE '" + abbrev + "%'"
+" GROUP BY substr(word,1," + alen + "+1)"
db.all(sql, function(err,rows){
for (var i=0;i<rows.length;i++) {
dataArray[i] = { abbrev: rows[i].abbr, count: rows[i].wordcount } }
res.send(dataArray); //Express will stringify data, set Content-type
});
});



router.get('/search/:abbrev/searchsensitivity/:ssVal', function(req, res, next) {
  var searchsensitivity = ((req.params.ssVal).trim() == 'true') || false;
  if (! (typeof searchsensitivity === 'boolean')){
    searchsensitivity = false;
  }
  db.run("PRAGMA case_sensitive_like = " + searchsensitivity);

var abbrev = req.params.abbrev;
var threshold = req.query.threshold;
if (threshold && abbrev.length < Number(threshold)) {
res.status(204).send() //204: Success, No Content.
return;
}
var query = ( "SELECT id,word FROM words "+" WHERE word LIKE '" + abbrev + "%' ORDER BY word ");
db.all(query, function(err,data) {
if (err) {
  res.status(500).send("Database Error");
} else {
  res.status(200).json(data);
 }
})
 });



router.get('/dictionary/:wordId', function(req, res, next){
  var wordId = req.params.wordId;
  var query = ("SELECT id,word FROM words WHERE id=" + wordId );
  db.get(query, function(err,data){
    if(err){
      res.status(500).send("Database Error");
    }else if(data === null){
      res.status(404).send("Word not found!")
    }
    else{
      // res.status(200).json(data);
      res.wordData = data;
      next();
    }
  })
})
router.get('/dictionary/:wordId/', function(req, res, next){
  var word = res.wordData.word;
  res.wordData.twitter= {};
  var twitSearch = "https://api.twitter.com/1.1/search/tweets.json?";
  twitSearch+="q=";
  twitSearch+="%23" + word;
  twitSearch+="&result_type=recent";
  console.log("secondlog");
  twitClient.get(twitSearch, twitParams, function(error,tweets, response){
    if(error){
      console.log("Twitter Fail");
      console.error(error);
    }
    else{
      res.wordData.twitter = tweets;
    }
    res.status(200).json(res.wordData);
  })
})
router.delete('/dictionary/:wordId/', function(req, res, next){
  var wordId= req.params.wordId;
  var query = ("DELETE FROM words where id=" + wordId);
  db.run(query, function(err){
    if(err){
      res.status(404).send("Word doesnt exist");
    }
    else{
      res.status(202).send();
    }
  })
})
router.put('/dictionary/:wordId/',function(req, res, next){
  var wordId = req.params.wordId;
  var wordChange = req.body.word;
  if(wordChange === null){
    res.status(404).send("No change found.")
    return;
  }
  var query1 = ("Select word FROM words where id=" + wordId);
    db.get(query1, function(err,data){
      if(err){
        res.status(404).send("Word not found!")
      }
      else{
          // console.log(data.word);
          // console.log(wordChange);
          // console.log(data.word === wordChange);
          if(data.word === wordChange){
            // console.log("inside if 409");
            res.status(409).send("Word has no difference from original")
            return;
          }
          else{
            var query = ("UPDATE words SET word ='"+wordChange  + "' WHERE id =" + wordId );
            // console.log(query); Update words set word ='apples' where id = 5
            db.run(query, function(err,data){
              if(err){
                // console.log(err + "insdie update if");
                res.status(409).send("Database Error");
              }
              else{
                res.status(200).send(data);
              }
          })
        }
      }
    })
})
router.post('/dictionary/',function(req, res, next){
  // console.log(req.body.word);
  // console.log("hello");
  var word = req.body.word;
  var wordOBj = {};
  var query1 = ("Select id,word FROM words where word ='" + word+ "'");
    db.get(query1, function(err,data){
      // console.log(data);
          if(data){
            if(data.word === word){
              res.status(303).send("Word already exists!")
              return;
            }
          }
          else{
            var query = ("INSERT INTO words VALUES (null,'" + word + "')");
            db.run(query, function(err,data){
              if(err){
                res.status(409).send("Database Error");
                return;
              }
              else{
                 wordOBj.id = this.lastId;
                 var newUrl = req.baseUrl + "/dictionary/"+ wordOBj.id;
                 res.set("Location", newUrl);
                res.status(201).json(wordOBj);
              }
            })
          }
})
})
 module.exports = router;
