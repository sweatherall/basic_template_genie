var fs = require('fs-extra');
var path = require('path');
var creationTemplate = require('./creation_template.js');

// paths relative to `package.json`
var grantableWishesPath = './grantable_wishes';
var grantableWishesMetaPath = './grantable_wishes__meta';
var wishAssets = ['./imgs', './css', './js'];
var wishGrantedPath = './wish_granted';

console.log('template genie summoned...');

// first: clean up the previously granted wish
try {
  for (var file of fs.readdirSync(wishGrantedPath)) {
    fs.removeSync(path.join(wishGrantedPath, file));
  }
}
catch (err){
  console.log('Error during cleanup: '+err);
  process.exit(1);
}

// second: read everything from grantable_wishes, grantable_wishes_meta directories
var grantableWishes = {}, grantableWishesMeta = {};

console.log('realizing grantable wishes...');
try {
  for(var wish of fs.readdirSync(grantableWishesPath)){
    grantableWishes[wish] = fs.readFileSync(path.join(grantableWishesPath,wish),'utf8');
  }
}
catch (err){
  console.log('obstable encountered with grantable wishes: '+err);
  process.exit(1);
}

console.log('realizing grantable wishes metadata...');
try {
  for(var wishMeta of fs.readdirSync(grantableWishesMetaPath)){
    grantableWishesMeta[wishMeta] = fs.readFileSync(path.join(grantableWishesMetaPath,wishMeta),'utf8');
  }
}
catch (err){
  console.log('obstable encountered with grantable wishes metadata: '+err);
  process.exit(1);
}


// third: grant each wish from the data provided, using the template.
console.log('granting wish...');
try {
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
catch (err){
  console.log('error during wish generation: '+err);
  process.exit(1);
}

// fourth: copy directories with assets into wish_granted folder
console.log('actualizing wish...');

try {
  for(var asset of wishAssets){
    fs.copySync(asset, path.join(wishGrantedPath,asset));
  }
}
catch (err){
  console.log('error during wish actualization: '+err);
  process.exit(1);
}

// fin
console.log('thank you come again!');
