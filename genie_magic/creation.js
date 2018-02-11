var fs = require('fs-extra');
var path = require('path');
var creationTemplate = require('./creation_template.js');

// paths relative to `package.json`
var grantableWishesPath = './grantable_wishes';
var grantableWishesMetaPath = './grantable_wishes__meta';
var wishAssets = ['./wish_assets/imgs', './wish_assets/css', './wish_assets/js'];
var wishGrantedPath = './wish_granted';

// a place to store wishes + wish metadata
var grantableWishes = {}, grantableWishesMeta = {};

console.log('template genie summoned...');

// clean up the previously granted wish
var cleanUpOldWish = function(files) {
  for (var file of files) {
    fs.removeSync(path.join(wishGrantedPath, file));
  }
};

// read everything from grantable_wishes directory
var readWishes = function() {
  console.log('realizing grantable wishes...');
  for(var wish of fs.readdirSync(grantableWishesPath)){
    grantableWishes[wish] = fs.readFileSync(path.join(grantableWishesPath,wish),'utf8');
  }
};
// read everything from grantable_wishes_meta directory
var readWishesMeta = function() {
  console.log('realizing grantable wishes meta...');
  for(var wishMeta of fs.readdirSync(grantableWishesMetaPath)){
    grantableWishesMeta[wishMeta] = fs.readFileSync(path.join(grantableWishesMetaPath,wishMeta),'utf8');
  }
};

// grant each wish from the data provided, using the markdown template
var grantWishes = function() {
  console.log('granting wishes...');
  for(var wish of Object.entries(grantableWishes)) {
    var pageName = wish[0].slice(0, wish[0].lastIndexOf('.'));
    var metaData = grantableWishesMeta.hasOwnProperty(pageName+'.json')
      ? JSON.parse(grantableWishesMeta[pageName+'.json'])
      : {};
    metaData.title = metaData.title || pageName;
    var pageContent = wish[1];
    fs.writeFileSync(
      path.join(wishGrantedPath,pageName+'.html'),
      creationTemplate.createPage(pageContent, metaData));
  }
}

// copy directories + assets into wish_granted folder
var revealWishes = function() {
  console.log('presenting wishes...');
  for(var asset of wishAssets){
    fs.copySync(asset, path.join(wishGrantedPath,asset));
  }
}



fs.readdir(wishGrantedPath)
.then(cleanUpOldWish, function(err) {
  if (err) {
    console.log('error cleaning up old wish...');
    console.log(err);
    process.exit(1);
  }
}).then(readWishes, function(err) {
  if (err) {
    console.log('error reading wish markdown file...');
    console.log(err);
    process.exit(1);
  }
}).then(readWishesMeta, function(err) {
  if (err) {
    console.log('error reading wish json file...');
    console.log(err);
    process.exit(1);
  }
}).then(grantWishes, function(err) {
  if (err) {
    console.log('error granting wish...');
    console.log(err);
    process.exit(1);
  }
}).then(revealWishes, function(err) {
  if (err) {
    console.log('error revealing wish...');
    console.log(err);
    process.exit(1);
  }
}).then(function() {
  console.log('fin!');
});
