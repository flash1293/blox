
gameEngine.builder.normal = function(map,conf) {
	for(var i=0;i<config.mapWidth;i++) {
		var topLevel = Math.floor(Math.sin(i/conf.sinLength)*conf.amplitude+conf.offset);
		for(var j=topLevel;j<config.mapHeight;j++) {
			var block;
			if(j==topLevel) block = gameEngine.BlockFactory({x:i, y: j, type: 'grass'});
			else if(j>(topLevel+conf.stoneLevel)) block = gameEngine.BlockFactory({x:i, y: j, type: 'stone'});
			else block = gameEngine.BlockFactory({x:i, y: j, type: 'dirt'});
			map.push(block.sprite);
		}
	}
	
	var block = new gameEngine.BlockFactory({x:3, y: 4, type: 'dirt'});
	map.push(block.sprite);
	
};
