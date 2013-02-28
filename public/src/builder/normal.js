
/**
 * very simple map-generator (just sin-hills with dirt and grass on top)
 * parameters:
 * 	sinLength: width of the hills
 * 	offset: space between hill-baseline and top of the map
 * 	amplitude: height of the hills
 * 	stoneLevel: amount of dirt-blocks before stone-blocks
 *
 * */
gameEngine.builder.normal = function(map,conf) {
	for(var i=0;i<config.mapWidth;i++) {
		var topLevel = Math.floor(Math.sin(i/conf.sinLength)*conf.amplitude+conf.offset);
		for(var j=0;j<config.mapHeight;j++) {
			var block;
			if(j<topLevel) block = gameEngine.BlockFactory({x:i,y:j,type:'void'});
			else if(j==topLevel) block = gameEngine.BlockFactory({x:i, y: j, type: 'grass'});
			else if(j>(topLevel+conf.stoneLevel)) block = gameEngine.BlockFactory({x:i, y: j, type: 'stone'});
			else block = gameEngine.BlockFactory({x:i, y: j, type: 'dirt'});
			map.push(block.sprite);
		}
	}
	
	var block = new gameEngine.BlockFactory({x:3, y: 4, type: 'dirt'});
	map.push(block.sprite);
	
};
