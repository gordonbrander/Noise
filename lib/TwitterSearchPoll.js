var
__def = require('./__inheritance.js').__def,
Twitter = require('twitter'),

TwitterSearchPoll = __def({
  constructor: function(terms, timeout) {
    this.timeout = timeout || 5000;
    this.terms = terms;
    this.twitter = new Twitter();
  },

  pollOnce: function(callback) {
    this.twitter.search(this.terms, function(search) {
      if (search.error) {
        callback(new Error(
          "Looks like Twitter is blocking you because of rate limits. Out of luck."
        ));
        return;
      };
      if (!search.results) {
        callback(new Error(
          "No results for search terms."
        ));
        return;
      };

      callback(null, search);
    }.bind(this));
  },
  
  poll: function(callback){
    this.pollOnce(callback);
    this.timer = setTimeout(function(){
      this.poll(callback);
    }.bind(this), this.timeout);
  },

  stop: function() {
    clearTimeout(this.timer);
  }

  /*
  processSearchResults: function(tweetsViaSearchAPI) {
    var out = [];
    tweetsViaSearchAPI.forEach(function (tweet) {
      out.push({
        tweetID: sanitize(tweet.id).toInt(),
        created: sanitize(tweet.created_at).xss(),
        fromUser: sanitize(tweet.from_user).xss(),
        fromUserID: sanitize(tweet.from_user_id).toInt(),
        toUserID: sanitize(tweet.to_user_id).xss(),
        avatar: sanitize(tweet.profile_image_url).xss(),
        lang: sanitize(tweet.iso_language_code).xss(),
        text: sanitize(tweet.text).xss()
      });
    });
    return out;
  }
  */
});

exports.TwitterSearchPoll = TwitterSearchPoll;