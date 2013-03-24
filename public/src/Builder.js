/**
* A class for all map-generators
*
* @module Blox
* @submodule Game
* @class Builder 
*/
gameEngine.builder = {
	/**
	 * very simple map-generator (just sin-hills with dirt and grass on top)
	 * @method normal
	 * @param {TileMap} map the map-oject to put the blocks in
	 * @param {Object} conf the configuration for the build-process
	 * 		sinLength: width of the hills
	 * 		offset: space between hill-baseline and top of the map
	 * 		amplitude: height of the hills
	 * 		stoneLevel: amount of dirt-blocks before stone-blocks
	 * */
	normal: function(map,conf) {
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
		//dig the caves
		this.caves(map,conf,'void');
		//rohstoffe
		this.caves(map,conf,'coal');
		this.caves(map,conf,'gold');
		this.caves(map,conf,'silver');
		//plant the tress
		this.trees(map,conf);
	},
	/**
	 * cave-generator. use additional to other generators
	 * @method trees
	 * @param {TileMap} map the map-oject to put the blocks in
	 * @param {Object} conf the configuration for the build-process
	 * 		seed: seed for random generator
	 * 		caveAmount: the amount of caves
	 * 		caveMinLength: the minimal length of a cave
	 * 		caveMaxLength: the max length of a cave
	 * @param {String} type the block-type the cave is filled with 
	 * */	
	caves: function(map, conf, type) {
		gen = new gameEngine.RandomGenerator(conf[type+'Seed']);
		for(var i=0;i<conf[type+'CaveAmount'];i++) {
			var caveLength = gen.next(conf[type+'CaveMinLength'],conf[type+'CaveMaxLength']);
			var cavePos = gen.next(0,config.mapWidth-1-caveLength);
			
			//search ground
			var ground = 0;
			while(!map.getBlockAt(cavePos,ground).staticInfo.collision) {
				ground++;
			}
			ground--;
			
			var cavePosY = gen.next(ground,config.mapHeight-3);
			var currentCaveHeight = 2;
			
			for(var j=0;j<caveLength;j++) {
				for(var k=0;k<currentCaveHeight;k++) {
					if(cavePosY+k < config.mapHeight) map.replaceBlockAt(cavePos,cavePosY+k,type);
				}
				cavePos++;
				cavePosY += (gen.next(0,3)-2);
				currentCaveHeight += (gen.next(0,3)-2);
				if(currentCaveHeight <= 2) currentCaveHeight = 2;
				if(currentCaveHeight > conf[type+'CaveMaxHeight']) currentCaveHeight = conf[type+'CaveMaxHeight'];
			}
		}
	},
	/**
	 * tree-generator. use additional to other generators
	 * @method trees
	 * @param {TileMap} map the map-oject to put the blocks in
	 * @param {Object} conf the configuration for the build-process
	 * 		treeStartPos: width of the hills
	 * 		treeMaxDif: the maximal difference between two trees
	 * 		treeMinDif: the minimal difference between two trees
	 * */	
	trees: function(map, conf) {
		gameEngine.log("planting trees");
	
		var treePos = conf.treeStartPos;
		var tree = 1;
	
		while(treePos < config.mapWidth) {
			//search ground
			var ground = 0;
			while(!map.getBlockAt(treePos,ground).staticInfo.collision) {
				ground++;
			}
	
			ground--;
	
			gameEngine.log("place tree @"+treePos+','+ground);
	
			map.replaceBlockAt(treePos,ground,'wood');
			map.replaceBlockAt(treePos,ground-1,'wood');
			map.replaceBlockAt(treePos,ground-2,'wood');
			map.replaceBlockAt(treePos,ground-3,'wood');
			map.replaceBlockAt(treePos,ground-4,'wood');
			map.replaceBlockAt(treePos,ground-5,'leaves');
			map.replaceBlockAt(treePos,ground-6,'leaves');
			map.replaceBlockAt(treePos,ground-7,'leaves');
			map.replaceBlockAt(treePos+1,ground-5,'leaves');
			map.replaceBlockAt(treePos+1,ground-6,'leaves');
			map.replaceBlockAt(treePos+1,ground-7,'leaves');
			map.replaceBlockAt(treePos-1,ground-5,'leaves');
			map.replaceBlockAt(treePos-1,ground-6,'leaves');
			map.replaceBlockAt(treePos-1,ground-7,'leaves');
			map.replaceBlockAt(treePos-2,ground-6,'leaves');
			map.replaceBlockAt(treePos+2,ground-6,'leaves');
			map.replaceBlockAt(treePos,ground-8,'leaves');
	
			treePos += Math.abs(Math.floor(Math.sin(tree)*conf.treeMaxDif))+conf.treeMinDif;
			tree++;
		}
	}
}


