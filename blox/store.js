var redis  = require("redis"),
    client = redis.createClient(),
    config = require('../public/config.json');
    
module.exports = {
	get: function(key,cb) {
		client.get(config.storePrefix+':'+config.storeKey+':'+key, function(err, reply) {
		    cb(reply);
		});
	},
	getList: function(key,cb) {
		client.llen(config.storePrefix+':'+config.storeKey+':'+key,function(err, reply) {
			client.lrange(config.storePrefix+':'+config.storeKey+':'+key,0,reply,function(err, reply) {
				cb(reply);
			});
		});
	},
	lpush: function(key,value) {
		client.lpush(config.storePrefix+':'+config.storeKey+':'+key, value,function(){});
	},
	set: function(key,value) {
		client.set(config.storePrefix+':'+config.storeKey+':'+key, value,function(){});
	},
};
