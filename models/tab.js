var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

Tab = function(options) {
  var _parent = this;

  this.db= new Db(options.db, new Server(options.host, options.port, {auto_reconnect: true}, {}));
 
  this.db.open(function(err) {
        _parent.db.authenticate(options.username, options.password, function(err) {
            if (err) {
              console.log(err);
            }
        });
    });
};

//getCollection
Tab.prototype.getCollection= function(callback) {
  this.db.collection('tabs', function(error, tabs_collection) {
    if( error ) callback(error);
    else callback(null, tabs_collection);
  });
};

//findAll
Tab.prototype.findAll = function(callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        tabs_collection.find().limit(50).toArray(function(error, results) {
          if( error ) {
            callback(error);
          }
          else {
            callback(null, results);
          }
        });
      }
    });
};

//findByArtist
Tab.prototype.findByArtist = function(artist, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        var search = new RegExp("(.*)" + artist + "(.*)", 'i');

        tabs_collection.find({artist: search}).limit(2000).toArray(function(error, results) {
          if( error ) {
            callback(error);
          }
          else {
            callback(null, results);
          }
        });
      }
    });
};

//findByTitle
Tab.prototype.findByTitle = function(title, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        var search = new RegExp("(.*)" + title + "(.*)", 'i');

        tabs_collection.find({artist: search}).limit(2000).toArray(function(error, results) {
          if( error ) {
            callback(error);
          }
          else {
            callback(null, results);
          }
        });
      }
    });
};

//findByTitleOrArtist
Tab.prototype.findByTitleOrArtist = function(keywords, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {

        var searches = [];
        keywords.forEach(function(keyword){
          searches.push(new RegExp("(.*)" + keyword + "(.*)", 'i'));
        });
        console.log(searches);

        //get the distinct docs matching these keywords
        tabs_collection.distinct('_id', {
          "$or": [
            {title: {"$in": searches}},
            {artist: {"$in": searches}}
          ]
        }, function(error, distinct_docs) {
            console.log(distinct_docs);
            //now get the full dataset for these distinct docs
            tabs_collection.find({
              _id: {"$in": distinct_docs}
            }).limit(2000).toArray(function(error, results) {
              if( error ) {
                callback(error);
              }
              else {
                callback(null, results);
              }
            });

        });
      }
    });
};

//findPopular
Tab.prototype.findPopular = function(limit, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        tabs_collection.find().sort([['views', -1, 'created_on', 1]]).limit(limit).toArray(function(error, results) {
          if( error ) {
            callback(error);
          }
          else {
            callback(null, results);
          }
        });
      }
    });
};

//findById
Tab.prototype.findById = function(id, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        tabs_collection.findOne({_id: tabs_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) {
            callback(error);
          }
          else {
            callback(null, result);
          }
        });
      }
    });
};

//save
Tab.prototype.save = function(tabs, callback) {
    this.getCollection(function(error, tabs_collection) {
      if( error ) {
        callback(error);
      }
      else {
        if( typeof(tabs.length)=="undefined")
          tabs = [tabs];

        for( var i =0;i< tabs.length;i++ ) {
          tab = tabs[i];
          tab.created_on = new Date();
        }

        tabs_collection.insert(tabs, function() {
          callback(null, tabs);
        });
      }
    });
};

exports.Tab = Tab;
