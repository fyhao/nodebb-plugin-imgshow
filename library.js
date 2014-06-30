var util = require('./util.js').lib;

module.exports.onLoad = function(app, middleware, controllers) {


	var nconf = module.parent.require('nconf');
	console.log('version:'+nconf.version);
	console.log('url:'+nconf.get('url'));


	function render(req, res, next) {
		// TODO to get nodebb version automatically
		var topic = req.param('topic', '');
		var page = req.param('page', '');
		var q = 'q:name=core,site_type=nodebb,version=nodebb ' + nconf.version + ',action=help';
		if(topic != '') {
			q += ',topic=' + topic;
		}
		if(page != '') {
			q += ',page=' + page;
		}
		util.imgshow().load(q, function(result) {
			res.header('content-type','text/html');
			res.end(result);
		});
		
	}

	app.get('/plugins/imgshow/help', render);
	var servicesResult = null;
	app.get('/plugins/imgshow/getservices', function(req, res) {
		if(servicesResult != null) {
			res.header('content-type', 'text/json');
			res.end(servicesResult);
		} else {
			util.imgshow().load('q:name=core,action=structure,format=json,language=en', function(result) {
				servicesResult = result;
				res.header('content-type', 'text/json');
				res.end(servicesResult);
			})
		}
	})



};


module.exports.renderHelp = function(helpContent, callback) {
    helpContent += '<p>Imgshow lets users post media content, such as Youtube, Facebook Video, Weather, please visit <a href="/plugins/imgshow/help" target="_blank">Online Help Documentation</a> for more information.</p>';
    callback(null, helpContent);
}


module.exports.parse = function(postContent, callback) {
    replace(postContent, function(result) {
        callback(null, result);
    });
};

var cache = {};
setInterval(function() {
    cache = {};
}, 60000 * 15); 
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
    	// TODO refer async.parallel for below code
        while(postContent.search(regex) >= 0) {
            count++;
            postContent = postContent.replace(regex, function(match, param1, param2){
                var key = 'imgshow_temp_' + count;
                var query = template;
                if(typeof param1 != 'undefined') query = query.replace('##1', param1);
                if(typeof param2 != 'undefined') query = query.replace('##2', param2);
                
                if(typeof cache[query] != 'undefined') {
                	debug("imgshow query cache:" + query);
                    process.nextTick(function() {
                        var result = cache[query];
                        postContent = postContent.replace(key, result);
                        stepFunc();
                    })
                }
                else {
                  debug("imgshow query api:" + query);
                  queryAPI(query, function(result) {
                        cache[query] = result;
                        postContent = postContent.replace(key, result);
                        stepFunc();
                    })  
                }
                
                return key;
            });
        }
    }
    
    imgshow(/\[imgshow (.+?)\]/, '##1');
    imgshow(/\[youtube (.+?)\]/, 'q:name=youtube,k=##1');
    imgshow(/\[vimeo (.+?)\]/, 'q:name=vimeo,k=##1');
    imgshow(/\[fbvideo (.+?)\]/, 'q:name=fbvideo,code=##1');
    imgshow(/\[bliptv (.+?)\]/, 'q:name=bliptv,k=##1');
    imgshow(/\[dailymotion (.+?)\]/, 'q:name=dailymotion,code=##1');
    imgshow(/\[qrcode (.+?)\]/, 'q:name=qrcode,text=##1');
    imgshow(/\[flash (.+?)\]/, 'q:name=flash,url=##1');
    imgshow(/\[gdoc (.+?)\]/, 'q:name=gdoc,url=##1');
    imgshow(/\[slideshare (.+?)\]/, 'q:name=slideshare,code=##1');
    imgshow(/\[gmap ([0-9.-]+).+?([0-9.-]+)\]/, 'q:name=gmap,lat=##1,lng=##2');
    imgshow(/\[bingmap ([0-9.-]+).+?([0-9.-]+)\]/, 'q:name=bingmap,lat=##1,lng=##2');
    imgshow(/\[weather ([0-9.-]+).+?([0-9.-]+)\]/, 'q:name=weather,lat=##1,lng=##2,display=label');
    stepFunc();
}

var queryAPI = function(query, callback) {
    util.imgshow().load(query, callback);
}

var debug = function(message) {
    console.log('DEBUG:' + message);
}
