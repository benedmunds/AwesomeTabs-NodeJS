var tabCounter = 1;

TabProvider = function(){};
TabProvider.prototype.dummyData = [];

TabProvider.prototype.findAll = function(callback) {
  callback( null, this.dummyData );
};

TabProvider.prototype.findById = function(id, callback) {
  var result = null;
  for(var i =0;i<this.dummyData.length;i++) {
    if( this.dummyData[i]._id == id ) {
      result = this.dummyData[i];
      break;
    }
  }
  callback(null, result);
};

TabProvider.prototype.save = function(tabs, callback) {
  var tab = null;

  if( typeof(tabs.length)=="undefined")
    tabs = [tabs];

  for( var i =0; i< tabs.length; i++ ) {
    tab = tabs[i];
    tab._id = tabCounter++;
    tab.created_on = new Date();

    this.dummyData[this.dummyData.length]= tab;
  }

  callback(null, tabs);
};

/* Lets bootstrap with dummy data */
new TabProvider().save([
  {artist: 'Ben', title: 'Post one', text: 'Body one', created_on: new Date()}
], function(error, tabs){});

exports.TabProvider = TabProvider;

