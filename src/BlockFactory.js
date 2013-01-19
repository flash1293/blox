
/*
 * Beispiel für das options-Objekt:
 * x: x-Koordinate
 * y: y-Koordinate
 * type: Typ des Blocks (läd statische einstellungen aus blocks.json)
 *
 * */
gameEngine.BlockFactory = function(options) {
	block = {};
	block.x = options.x;
	block.y = options.y;
	block.staticInfo = jaws.assets.get("assets/blocks.json")[options.type];
	block.sprite = new jaws.Sprite({
		image: 'assets/blocks/'+block.staticInfo.sprite,
		scale: 1,
		anchor: 'top_left',
		x: options.x*config.blockSize,
		y: options.y*config.blockSize
	});
	block.sprite.block = block;
	block.name = options.type;

	return block;
}
