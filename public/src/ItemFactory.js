
/*
 * Beispiel für das options-Objekt:
 * type: Typ des Blocks (läd statische einstellungen aus blocks.json)
 * amount: Anzahl
 *
 * */
gameEngine.ItemFactory = function(options) {
	var item = {};

	//loaded static parameters from block.json
	item.staticInfo = jaws.assets.get("assets/items.json")[options.type];

	item.type = options.type;
	item.amount = options.amount;	

	//return block-object to include it in the tilemap
	return item;
}
