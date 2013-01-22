
/*
 * Beispiel für das options-Objekt:
 * x: x-Koordinate
 * y: y-Koordinate
 * type: Typ des Blocks (läd statische einstellungen aus blocks.json)
 *
 * */
gameEngine.BlockFactory = function(options) {
	block = {};

	//save block-coordinates (NOT px-coordinates)
	block.x = options.x;
	block.y = options.y;

	//loaded static parameters from block.json
	block.staticInfo = jaws.assets.get("assets/blocks.json")[options.type];

	//create sprite for the block
	block.sprite = new jaws.Sprite({
		image: 'assets/blocks/'+block.staticInfo.sprite,
		scale: 1,
		anchor: 'top_left',
		x: options.x*config.blockSize,
		y: options.y*config.blockSize
	});

	//create a back-reference in the sprite-object
	block.sprite.block = block;
	block.name = options.type;

	//return block-object to include it in the tilemap
	return block;
}
