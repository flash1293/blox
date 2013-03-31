var redis  = require("redis"),
    client = redis.createClient(),
    config = require('../public/config.json');
    
var getPrefix = function(global) {
	return config.storePrefix+':'+(global ? "" : config.storeKey+':');
};
    
module.exports = {
	get: function(key,cb, global) {
		client.get(getPrefix(global)+key, function(err, reply) {
		    cb(reply);
		});
	},
	getList: function(key,cb, global) {
		client.llen(getPrefix(global)+key,function(err, reply) {
			client.lrange(getPrefix(global)+key,0,reply,function(err, reply) {
				cb(reply);
			});
		});
	},
	lpush: function(key,value, global) {
		client.lpush(getPrefix(global)+key, value,function(){});
	},
	set: function(key,value) {
		client.set(getPrefix(global)+key, value,function(){});
	},
	tryToSet: function(key, value, pcb, ncb, global) {
		client.setnx(getPrefix(global)+key, value,function(err,suc){
			if(suc===1) {
				pcb();
			} else {
				ncb();
			}
		});
	},
	lock: function(ip,pcb,ncb,global) {
		var now = Date.now();
  		var timeout = now + config.shareInterval;
  		var lockKey = getPrefix(global)+'lock:'+ip; 
		client.get(lockKey, function(err,suc){
			var original_timeout = new Number(suc);
			if (original_timeout < now) {
				client.set(lockKey, timeout, function() {});
				pcb();
			} else {
				ncb();
			}
		});
	}
};
