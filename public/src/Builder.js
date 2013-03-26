if(typeof gameEngine === "undefined") gameEngine = {};
if(typeof gameEngine.log === "undefined") gameEngine.log = function() {};
/**
* A random-number generator
*
* @module Blox
* @submodule Utilities
* @class RandomGenerator
* @constructor
* @params {mixed} seed The seed of the generator
*/
gameEngine.RandomGenerator = function(seed)
{
	var keySchedule = [];
	var keySchedule_i = 0;
	var keySchedule_j = 0;
	
	function init(seed) {
		for (var i = 0; i < 256; i++)
			keySchedule[i] = i;
		
		var j = 0;
		for (var i = 0; i < 256; i++)
		{
			j = (j + keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;
			
			var t = keySchedule[i];
			keySchedule[i] = keySchedule[j];
			keySchedule[j] = t;
		}
	}
	init(seed);
	
	function getRandomByte() {
		keySchedule_i = (keySchedule_i + 1) % 256;
		keySchedule_j = (keySchedule_j + keySchedule[keySchedule_i]) % 256;
		
		var t = keySchedule[keySchedule_i];
		keySchedule[keySchedule_i] = keySchedule[keySchedule_j];
		keySchedule[keySchedule_j] = t;
		
		return keySchedule[(keySchedule[keySchedule_i] + keySchedule[keySchedule_j]) % 256];
	}
	
	this.getRandomNumber = function() {
		var number = 0;
		var multiplier = 1;
		for (var i = 0; i < 8; i++) {
			number += getRandomByte() * multiplier;
			multiplier *= 256;
		}
		return number / 18446744073709551616;
	}

	this.next = function(min,max) {
		var range = max - min;
		return Math.floor(this.getRandomNumber()*range + min + 1);
	} 
};
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
	normal: function(width, height, map, conf) {
		for(var i=0;i<width;i++) {
			var topLevel = Math.floor(Math.sin(i/conf.sinLength)*conf.amplitude+conf.offset);
			for(var j=0;j<height;j++) {
				var type;
				if(j<topLevel) type = 'void';
				else if(j==topLevel) type = 'grass';
				else if(j>(topLevel+conf.stoneLevel)) type = 'stone';
				else type = 'dirt';
				map.replaceBlockAt(i,j,type);
			}
		}
		//rohstoffe
		this.caves(width, height, map,conf,'coal');
		this.caves(width, height, map,conf,'gold');
		this.caves(width, height, map,conf,'silver');
		//dig the caves
		this.caves(width, height, map,conf,'void');		
		//plant the tress
		this.trees(width, height, map,conf);
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
	caves: function(width, height, map, conf, type) {
		gen = new gameEngine.RandomGenerator(conf[type+'Seed']);
		for(var i=0;i<conf[type+'CaveAmount'];i++) {
			var caveLength = gen.next(conf[type+'CaveMinLength'],conf[type+'CaveMaxLength']);
			var cavePos = gen.next(0,width-1-caveLength);
			
			//search ground
			var ground = 0;
			while(!map.getBlockAt(cavePos,ground).staticInfo.collision) {
				ground++;
			}
			ground += conf[type+'CaveOffset'];
			
			var cavePosY = gen.next(ground,height-3);
			var currentCaveHeight = 2;
			
			for(var j=0;j<caveLength;j++) {
				for(var k=0;k<currentCaveHeight;k++) {
					if(cavePosY+k < height) map.replaceBlockAt(cavePos,cavePosY+k,type);
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
	trees: function(width, height, map, conf) {
		gameEngine.log("planting trees");
	
		var treePos = conf.treeStartPos;
		var tree = 1;
	
		while(treePos < width) {
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
};

if(typeof module !== "undefined" && ('exports' in module)) { module.exports = gameEngine.builder }

