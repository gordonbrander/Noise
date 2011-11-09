var
__def = require('./__inheritance.js').__def,
Twitter = require('twitter'),

TwitterSearchPoll = __def({
  constructor: function(terms, timeout, opts) {
    this.timeout = timeout || 5000;
    this.terms = terms;
    this.twitter = new Twitter();
    this.opts = opts || {};
  },

  pollOnce: function(callback) {
    var cb = function(search) {
      if (search.error) {
        callback.call(this, new Error(search.error));
        return;
      };
      if (!search.results) {
        callback.call(this, new Error(
          "No results for search terms."
        ));
        return;
      };
      callback.call(this, null, search);
    }.bind(this);
    
    if (this.opts) {
      this.twitter.search(this.terms, this.opts, cb);
    }
    else {
      this.twitter.search(this.terms, cb);
    };
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
});

exports.TwitterSearchPoll = TwitterSearchPoll;