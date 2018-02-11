var fs = require('fs-extra');
var path = require('path');
var creationTemplate = require('./creation_template.js');

// all paths are relative to `package.json`
var grantableWishesPath = './grantable_wishes';
var grantableWishesMetaPath = './grantable_wishes__meta';
var wishAssets = ['./wish_assets/imgs', './wish_assets/css', './wish_assets/js'];
var wishGrantedPath = './wish_granted';
// a place to store wishes + wish metadata
var grantableWishes = {}, grantableWishesMeta = {};

console.log('template genie summoned...');

fs.readdir(wishGrantedPath)
.then(expelOldWish, function(err) {
  handleError(err,'error cleaning up old wish...')
}).then(readWishes, function(err) {
  handleError(err,'error reading wish markdown file...')
}).then(readWishesMeta, function(err) {
  handleError(err,'error reading wish json file...')
}).then(grantWishes, function(err) {
  handleError(err,'error granting wish...')
}).then(revealWishes, function(err) {
  handleError(err,'error revealing wish...')
}).then(function() {
  console.log('fin!');
}).catch(function(err) {
  handleError(err,'exception caught...')
});


// clean up the previously granted wish
function expelOldWish(files) {
  for (var file of files) {
    fs.removeSync(path.join(wishGrantedPath, file));
  }
};

// read everything from grantable_wishes directory
function readWishes() {
  console.log('realizing grantable wishes...');
  for(var wish of fs.readdirSync(grantableWishesPath)){
    grantableWishes[wish] = fs.readFileSync(path.join(grantableWishesPath,wish),'utf8');
  }
};
// read everything from grantable_wishes_meta directory
function readWishesMeta() {
  console.log('realizing grantable wishes meta...');
  for(var wishMeta of fs.readdirSync(grantableWishesMetaPath)){
    grantableWishesMeta[wishMeta] = fs.readFileSync(path.join(grantableWishesMetaPath,wishMeta),'utf8');
  }
};

// grant each wish from the data provided, using the markdown template
function grantWishes() {
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
function revealWishes() {
  console.log('presenting wishes...');
  for(var asset of wishAssets){
    fs.copySync(asset, path.join(wishGrantedPath,asset));
  }
}

// fxn to handle any errors
function handleError(err,msg) {
  if (err) {
    console.log(msg);
    console.log(err);
    process.exit(1);
  }
};
