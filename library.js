
module.exports.parse = function(postContent, callback) {
    replace(postContent, function(result) {
        callback(null, result);
    });
    
};

var cache = {};
setInterval(function() {
    cache = {};
}, 60000 * 5); 
// adjust the value above based on your environment. set too high then the cache may very large when you had high traffic or high number of queries.
// set too low then it may introduce more traffic to API Server that may bring down it. so be fair. adjust it.


var replace = function(postContent, callback) {
    var count = 0;
    var step = -1;
    var stepFunc = function() {
        step++;
        if(step == count) {
            callback(postContent);
        }
    }
    var imgshow = function(regex, template) {
        while(postContent.search(regex) >= 0) {
            count++;
            postContent = postContent.replace(regex, function(match, contents){
                var key = 'imgshow_temp_' + count;
                var query = template.replace('##', contents);
                if(typeof cache[query] != 'undefined') {
                    process.nextTick(function() {
                        var result = cache[query];
                        postContent = postContent.replace(key, result);
                        stepFunc();
                    })
                }
                else {
                  queryAPI(query, function(result) {
                        cache[query] = result;
                        //debug('queryapi result: ' + result);
                        //debug('key: ' + key);
                        //debug(key + ':before ' + postContent);
                        postContent = postContent.replace(key, result);
                        //debug(key + ':after ' + postContent);
                        stepFunc();
                    })  
                }
                
                return key;
            });
        }
    }
    
    imgshow(/\[imgshow (.+?)\]/, '##');
    imgshow(/\[youtube (.+?)\]/, 'q:name=youtube,k=##');
    imgshow(/\[vimeo (.+?)\]/, 'q:name=vimeo,k=##');
    imgshow(/\[fbvideo (.+?)\]/, 'q:name=fbvideo,code=##');
    imgshow(/\[bliptv (.+?)\]/, 'q:name=bliptv,k=##');
    imgshow(/\[dailymotion (.+?)\]/, 'q:name=dailymotion,code=##');
    imgshow(/\[qrcode (.+?)\]/, 'q:name=qrcode,text=##');
    stepFunc();
}

var queryAPI = function(query, callback) {
    var util = require('./util.js').lib;
    util.imgshow().load(query, callback);
}

var debug = function(message) {
    console.log('DEBUG:' + message);
}