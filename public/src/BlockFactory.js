gameEngine = gameEngine || {};
/**
* A class for the blocks the map is made of
*
* @module Blox
* @submodule Game
* @class Block
* @constructor
* @param {Object} options The Options of the block. x: the x-coordiante of the block, y: the y-coordinate of the block
*/
gameEngine.Block = function(options) {
	//save block-coordinates (NOT px-coordinates)
	this.x = options.x;
	this.y = options.y;

	//loaded static parameters from block.json
	this.staticInfo = jaws.assets.get("assets/blocks.json")[options.type];

	this.health = this.staticInfo.health;
	
	//create sprite for the block
	this.sprite = new jaws.Sprite({
		image: 'assets/blocks/'+this.staticInfo.sprite,
		scale: 1,
		anchor: 'top_left',
		x: options.x*config.blockSize,
		y: options.y*config.blockSize
	});

	//create a back-reference in the sprite-object
	this.sprite.block = this;
	this.name = options.type;	
};

/**
* handles the consume-process if a player decreased the health of a block to 0
* @method consume
* @param {Player} player The player which destroyed the Block
*/
gameEngine.Block.prototype.consume = function(player) {
	gameEngine.log("checking if block drops an item");
	if(this.staticInfo.drops !== undefined) {
		gameEngine.log("it does!");
		var rand = Math.random();
		//dropping happened!
		if(rand <= this.staticInfo.dropChance) {
			gameEngine.log("and we got the luck!");
			player.addItemsToInventory(this.staticInfo.drops, this.staticInfo.dropAmount);
		}
	}
};

/*
 * Beispiel für das options-Objekt:
 * x: x-Koordinate
 * y: y-Koordinate
 * type: Typ des Blocks (läd statische einstellungen aus blocks.json)
 *
 * */
gameEngine.BlockFactory = function(options) {
	return new gameEngine.Block(options);
}
