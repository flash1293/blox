//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

Object.defineProperty(
	Object.prototype,
	'foreach',
	{
		writable: false,
		enumerable: false,
		configurable: false,
		value: function( callback ) {
		    for( var k in this ) {
		        if(this.hasOwnProperty(k) && this[k] != undefined) {
		           callback( k, this[ k ] );
		        }
		    }
	   }
});



/**
* A class for the main game-controller
*
* @module Blox
* @submodule Controlling
* @class GameEngine
*/
var gameEngine = {
	/**
	 * setup method for jaws-link - called once
	 * @method setup
	 * */
	setup: function() {
		
		gameEngine.loadCache();
	
		//create empty list for active players in the world
		this.players = {};
	
		//create tilemap for world
		this.world = new TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});
	
		this.world.getBlockAt = function(x,y) {
			var sprites = this.cell(x,y);
			//gameEngine.log(sprites);
			for(var i=0;i<sprites.length;i++) {
				if(sprites[i].block !== undefined) return sprites[i].block;
			}
		};
		
		this.world.replaceBlockAt = function(x,y,type) {
			this.clearCell(x,y);
			var newBlock = gameEngine.BlockFactory({x:x,y:y,type:type});
			this.push(newBlock.sprite);
		};
	
		//call builder to create the world in the tilemap
		this.builder[config.builder.name](config.mapWidth, config.mapHeight, this.world,config.builder);
	
		//create viewport for the visible part of the map
		this.viewport = new jaws.Viewport({
			max_x: config.mapWidth*config.blockSize, 
			max_y: config.mapHeight*config.blockSize
		});
	
		//create main player (controlled by keyboard)
		this.player = gameEngine.PlayerFactory({x: config.startPosX, y: config.startPosY, type: 'minenarbeiter', controllMode: ('ontouchstart' in document.documentElement?'touch':'keyboard')});
		
		
	
		//add him to the players-list (activate him)
		this.players[0] = this.player;
	
		//initialize viewport-position (probably useless)
		this.viewport.moveTo(config.startPosX,config.startPosY);
	
		//timestamp-check for fps-independent game-logic
		this.lastUpdate = Date.now();
	
		//create hud
		this.hud = gameEngine.HUDFactory(this.player);
		this.hud.updateItembox();
	
		var lastChange = gameEngine.get("lastChange") || 0;
	
	
		if(config.multiplayer) {	
			socket.emit('register',{type: gameEngine.player.type, x: config.startPosX, y:config.startPosY, lastChange: lastChange});
			$('#waiting').show();
			jaws.game_loop.pause();
		} else {
			if(typeof mapDelta != "undefined") {
				var mapChanges = mapDelta || [];
				gameEngine.applyMapDelta(mapChanges);
			} else {
				var mapChanges = gameEngine.get("mapChanges") || [];
				gameEngine.applyMapDelta(mapChanges);
			}
			gameEngine.initOwnPlayer();
		}
		
		
	
	},
	applyMapDelta: function(mapChanges) {
		for(var i=0;i<mapChanges.length;i++) {
				var change = mapChanges[i];
				gameEngine.socketHandler.handleBlockChange(change,true);
			}
	},
	shareMap: function() {
		var mapName = prompt("What's the name of your map?");
		$.ajax({
			url: "/store",
			type: "post",
			data: {
				name: mapName,
				delta: JSON.stringify(gameEngine.get('mapChanges'))
			},
			success: function(data) {
				var status = data;
				if(status.ok) {
					alert('Upload complete!');
				} else {
					alert(status.msg);
				}
			}
		});
	},
	initOwnPlayer: function() {
		var inv = gameEngine.get("smallInventory");
		if(config.persistInventory && inv != null) {
			gameEngine.log("inventory load by cache");
			this.player.setInventory(inv);
			
		} else {
			this.player.setInventory(config.defaultInventory);
		}
		gameEngine.hud.updateItembox();
		
		var pos = window.location.hash.substr(1).split(',');
		if(pos.length == 2) {
			gameEngine.log("position set by hash");
			this.player.teleport(pos[0],pos[1]);
		} else if(config.persistPosition) {
			var position = gameEngine.get("position");
			gameEngine.log("position set by cache");
			if(position != null) this.player.teleport(position[0],position[1]);
		}
	},
	/**
	 * delegates game-logic, called every frame
	 * @method update
	 * */
	update: function() {
		var currentTimeStamp = Date.now();
		//get independent from game-logic (important for slow pcs and multiplayer)
		for(var i=this.lastUpdate;i<currentTimeStamp;i=i+config.physicalFrameTime) {
			//iterate all players 
			this.players.foreach(function(id, player){
				//make a descision for next move (input= ki/keyboard/...)
				player.controll();
				//move the player resp. to its vector-values (collision-check etc.)
				player.move();
				//adjust the used sprite for the player
				player.adjustDisplayMode();	
			});
		}
		//adjust position of the viewport
		this.viewport.centerAround(this.player.sprite);
		//for fps-independet game-logic
		this.lastUpdate = currentTimeStamp;
	},
	/**
	 * checks whether a coordinate is in the tolerated zone
	 * @method isInTolerance
	 * @param {Integer} coordiante1
	 * @param {Integer} coordiante2
	 * @return {Boolean} true if coordiantes are in tolerance
	 * */
	isInTolerance: function(a,b) {
		if(isNaN(a) || isNaN(b)) return false;
		return Math.abs(a - b) < config.positionUpdateTolerance;
	},
	/**
	 * checks whether its possible to plant a block at a certain position
	 * @method possibleToPlantHere
	 * @param {Integer} x The x-coordinate of the block
	 * @param {Integer} y The y-coordinate of the block
	 * @return {Boolean} true if it's possible to plant here 
	 * */
	possibleToPlantHere: function(x,y) {
		var left = gameEngine.world.cell(x-1,y);
		var right = gameEngine.world.cell(x+1,y);
		var above = gameEngine.world.cell(x,y-1);
		var bottom = gameEngine.world.cell(x,y+1);
		for(var i=0;i<left.length;i++) {
			if(left[i].block.staticInfo.isAnchor) return true;
		}
		for(var i=0;i<right.length;i++) {
			if(right[i].block.staticInfo.isAnchor) return true;
		}
		for(var i=0;i<above.length;i++) {
			if(above[i].block.staticInfo.isAnchor) return true;
		}
		for(var i=0;i<bottom.length;i++) {
			if(bottom[i].block.staticInfo.isAnchor) return true;
		}
		return false;
	},
	/**
	 * method with drawing-logic - delegates into game-objects
	 * @method draw 
	 * */
	draw: function() {
		//clear canvas
		jaws.clear();
		//draw map
		this.viewport.drawTileMap(this.world);
	
		//draw players
		this.viewport.apply( function() {
			gameEngine.players.foreach(function(key, player) {
				if(gameEngine.viewport.isPartlyInside(gameEngine.players[key].sprite)) gameEngine.players[key].draw();
			});
		});
	},
	showInventory: function() {
		if(gameEngine.hud.inventory.is(":visible")) {
			jaws.game_loop.unpause();
			gameEngine.hud.inventory.hide();
		} else {
			jaws.game_loop.pause();
			gameEngine.hud.inventory.show();
		}
	},
	/**
	 * logs a message, default is to console.log
	 * @method log
	 * @param {mixed} msg The message to log
	 * */
	log: function(msg) {
		if(config.debug) {
			console.log(msg);
		}
	}
};
