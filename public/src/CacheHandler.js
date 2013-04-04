gameEngine = gameEngine || {};
/**
* Handles the caching
*
* @module Blox
* @submodule Controlling
* @class CacheHandler
*/
gameEngine.localStorageFake = {};
if(localStorage === undefined) {
	gameEngine.log("no local storage available, no persistance available");
}
/**
 * returns a value from the local storage
 * @method get
 * @param {String} key The key of the wished value
 * */	
gameEngine.get = function(key) {
	return gameEngine.localStorageFake[(config.multiplayer ? "mp_ ":"sp_")+key];
};
/**
 * sets a value in the local storage
 * @method set
 * @param {String} key The key of the wished value
 * @param {mixed} value The value to store
 * */	
gameEngine.set = function(key,value) {
	gameEngine.localStorageFake[(config.multiplayer ? "mp_ ":"sp_")+key] = value;
};

gameEngine.persistCache = function() {
	if(localStorage !== undefined) {
		gameEngine.localStorageFake.foreach(function(key, value) {
			localStorage.setItem(key,JSON.stringify(value));
		});
	}
};

gameEngine.loadCache = function() {
	if(localStorage !== undefined) {
		var keys = Object.keys(localStorage);
		keys.foreach(function(key, item) {
			gameEngine.localStorageFake[item] = JSON.parse(localStorage.getItem(item));
		});
	}
};

gameEngine.clearCache = function() {
	if(localStorage !== undefined) {
		localStorage.clear();
		gameEngine.localStorageFake = {};
	}
}