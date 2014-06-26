/*
var util = require('./util.js').lib;
util.imgshow().load('q:name=youtube,k=test', function(data) {
  console.log(data);  
})
*/
var lib = require('./library.js');
lib.parse('test [gmap -1.23,4.567]', function(err, result) {
    console.log('Result');
    console.log(result);
});
