gameEngine = gameEngine || {};
/**
* Handles the caching
*
* @module Blox
* @submodule Controlling
* @class CacheHandler
*/
if(localStorage === undefined) {
	gameEngine.localStorageFake = {};
	gameEngine.log("no local storage available, using fake");
}
/**
 * returns a value from the local storage
 * @method get
 * @param {String} key The key of the wished value
 * */	
gameEngine.get = function(key) {
	if(localStorage !== undefined) {
		return JSON.parse(localStorage.getItem(key));
	}
	return gameEngine.localStorageFake[key];
};
/**
 * sets a value in the local storage
 * @method set
 * @param {String} key The key of the wished value
 * @param {mixed} value The value to store
 * */	
gameEngine.set = function(key,value) {
	if(localStorage !== undefined) {
		localStorage.setItem(key,JSON.stringify(value));
		return;
	}
	gameEngine.localStorageFake[key] = value;
};