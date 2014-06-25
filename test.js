var util = require('./util.js').lib;
util.imgshow().load('q:name=youtube,k=test', function(data) {
  console.log(data);  
})
