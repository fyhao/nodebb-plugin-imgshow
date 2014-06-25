var lib = {
	


    frequest : function(args) {
		http = require('http');
		
		try {
			var options = {};
		
			if(args.options) {
				
				options = args.options;
				
			}
			 
			if(args.url) {
				if(args.url.indexOf('http') == -1) return;
				var b = require('url').parse(args.url);
				
				// resolve host name
				if(b.hostname) {
					options.host = b.hostname;
				}
				
				// resolve port
				if(!b.port) {
					b.port = 80;
				}
				
				if(b.port) {
					options.port = b.port;
				}
				
				// resolve web path
				if(b.pathname) {
					options.path = b.pathname;
					
					if(b.search) {
						options.path += b.search;
					}
				}
					
			}
			
			if(args.headers) {
				options.headers = args.headers;
			}
		    
		    var request = http.get(options);
		
			if(args.callback || args.callbackJSON) {
				request.addListener('response', function(response){
				    var data = '';
				
				    response.addListener('data', function(chunk){ 
				        data += chunk; 
				    });
				    response.addListener('end', function(){
				        
				        // prepare data for callback
				        
				        if(data != '') {
				        	if(args.callback) {
					        	args.callback(data);
					        }
					        
					        if(args.callbackJSON) {
					        	try {
					        		var json = JSON.parse(data);
					        		args.callbackJSON(json);	
					        	
					        	} catch (e) {
					        		console.log(e);
					        	}
					        }
				        }
				        
				    });
				});
			}
		} catch (e) {
			console.log(e);
		}
		
		
	
	}
	
	,
	
	imgshow : function(request) {
	
        return {
            load : function(query, callback) {
                var unirest = require('unirest');
        	    var Request = unirest.get("https://fyhao-imgshow-platform.p.mashape.com/?k=" + encodeURIComponent(query) + "&api=1")
                  .headers({ 
                    "X-Mashape-Authorization": "i5deY4OELqM0XZp3NioVjsjhhi2nbTKF"
                  })
                  .end(function (response) {
                    callback(response.body);
                  });  
            }
        }
	}
}

var frequest = lib.frequest;
exports.lib = lib;