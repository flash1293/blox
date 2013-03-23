/**
* A class for items obtained by a player
*
* @module Blox
* @submodule Game
* @class Item
* @constructor
* @param {Object} options The Options of the Item - type: the name of the item, amount: the amount of the stack
*/
gameEngine.Item = function(options) {
	//loaded static parameters from block.json
	this.staticInfo = jaws.assets.get("assets/items.json")[options.type];

	this.type = options.type;
	this.amount = options.amount;	
}


/*
 * Beispiel für das options-Objekt:
 * type: Typ des Blocks (läd statische einstellungen aus blocks.json)
 * amount: Anzahl
 *
 * */
gameEngine.ItemFactory = function(options) {
	return new gameEngine.Item(options);
}
