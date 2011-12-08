/**
 * Module dependencies.
 */
var express = require('express'),
    socketIO = require('socket.io'),
    TwitterSearchPoll = require('./lib/TwitterSearchPoll.js').TwitterSearchPoll;

var app = module.exports = express.createServer(),
    io = socketIO.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.register('.html', require('ejs'));
  app.set('view engine', 'html');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'Captain America!' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/:hashtag?', function(req, res){
  
  io.sockets.on('connection', function (socket) {
    var callback = function(error, search){
      if (error) {
        return;
      };

      var tweets = [],
          results = search.results;
      for (var i = results.length - 1; i >= 0; i--) {
        tweets.push({
          id: results[i].id,
          from_user: results[i].from_user,
          text: results[i].text
        });
      };

      /* Get most recent tweet and set since_id.
      since_id ensures we only get tweets that happened
      after the ID of the tweet set. */
      var latestTweet = results.shift();
      if (latestTweet) {
        this.opts.since_id = latestTweet.id;
      };

      socket.emit('tweets', {
        tweets: tweets
      });
    };

    twitterPoll.poll(callback);
  });
  
  var query;
  if (req.params.hashtag) {
    query = req.params.hashtag;
  }
  else {
    query = '#occupywallst OR #ows OR #occupy';
  }
  
  var twitterPoll = new TwitterSearchPoll(
    query,
    (15*1000), // 15 seconds
    {
      /* 100 tweets per page */
      rpp: 100,
      /* Start with oldest page.
      Twitter enforces limit of 1500 results */
      page: (1500/100)
    }
  );
  
  res.render('index', {
    title: "Express",
    hashtag: query
  });
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
