var express = require('express');
var TabProvider = require('./tabprovider-mongodb').TabProvider;

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var tabProvider= new TabProvider('localhost', 27017);

app.get('/', function(req, res){

    //get the 20 most popular tabs
    tabProvider.findPopular(20, function(error,docs){

        //strip the " Tab" from the titles - clean the DB later to speed this up
        var tabs = [];
        if (docs !== undefined && docs.length > 0)
        {
          docs.forEach(function(tab){
            tabs.push({
              title: tab.title.replace(' Tab', ''),
              artist: tab.artist,
              created_on: tab.created_on,
              _id: tab._id
            });
          });
        }

        //render the index page
        res.render('index.jade', { locals: {
            title: 'AwesomeTabs',
            search_placeholder: 'Search',
            tabs:tabs
            }
        });
    });

});

app.get('/tab/:id', function(req, res) {

    //get this tab
    tabProvider.findById(req.params.id, function(something, doc){

        //render the view page
        res.render('view.jade', { locals: {
              title: 'AwesomeTabs',
              search_placeholder: 'Search',
              tab: {
                title: doc.title.replace(' Tab', ''),
                artist: doc.artist,
                created_on: doc.created_on,
                text: doc.text.replace('<br />', '')
              }
            }
        });

    });

});

app.post('/search', function(req, res) {

    var keywords = req.param('search').split(new RegExp("(-|by| )"));
    search_keywords = [];
    keywords.forEach(function(keyword){
      if (keyword.length > 0 && keyword != ' ' && keyword != '-')
        search_keywords.push(keyword);
    });

    tabProvider.findByTitleOrArtist(search_keywords, function(something, docs){

        //strip the " Tab" from the titles - clean the DB later to speed this up
        var tabs = [];
        if (docs !== undefined && docs.length > 0)
        {
          docs.forEach(function(tab){
            tabs.push({
              title: tab.title.replace(' Tab', ''),
              artist: tab.artist,
              created_on: tab.created_on,
              _id: tab._id
            });
          });
        }

        //render the search page
        res.render('search.jade', { locals: {
              title: 'AwesomeTabs',
              search_placeholder: req.param('search'),
              searched: req.param('search'),
              tabs: tabs
            }
        });

    });

});

app.get('/tab/new', function(req, res) {
    res.render('tab_new.jade', { locals: {
        title: 'New Tab'
    }
    });
});

app.post('/tab/new', function(req, res){
    tabProvider.save({
        artist: req.param('artist'),
        'title': req.param('title'),
        text: req.param('text')
    }, function( error, docs) {
        res.redirect('/');
    });
});


app.listen(process.env.PORT || 3000);