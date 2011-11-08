/**
 * Module dependencies.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    socketIO = require('socket.io'),
    TwitterSearchPoll = require('./lib/TwitterSearchPoll.js').TwitterSearchPoll;

var app = module.exports = express.createServer(),
    io = socketIO.listen(app),
    
    /*
    Prime number of seconds
    See http://designfestival.com/the-cicada-principle-and-why-it-matters-to-web-designers/
    */
    twitterPositive = new TwitterSearchPoll('OccupyWallSt OR #ows OR #Occupy :)', (13*1000)),
    twitterNegative = new TwitterSearchPoll('OccupyWallSt OR #ows OR #Occupy :(', (17*1000));

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

// Models

// Sockets

io.sockets.on('connection', function (socket) {
  
  twitterPositive.poll(function(error, search){
    if (error) {
      return;
    };

    var tweets = [],
        results = search.results;
    for (var i = results.length - 1; i >= 0; i--) {
      tweets.push({
        id: results[i].id,
        from_user: results[i].from_user,
        positive: true
      });
    };
    socket.emit('tweets', {
      tweets: tweets
    });
  });
  
  twitterNegative.poll(function(error, search){
    if (error) {
      return;
    };

    var tweets = [],
        results = search.results;
    for (var i = results.length - 1; i >= 0; i--) {
      tweets.push({
        id: results[i].id,
        from_user: results[i].from_user,
        positive: false
      });
    };
    socket.emit('tweets', {
      tweets: tweets
    });
  });
  
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: "Express",
    data: ""
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
