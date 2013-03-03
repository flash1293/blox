//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

Object.prototype.foreach = function( callback ) {
    for( var k in this ) {
        if(this.hasOwnProperty(k) && this[k] != undefined) {
           callback( k, this[ k ] );
        }
    }
}



//create global main-object
var gameEngine = {};


//setup method - called once
gameEngine.setup = function() {

	//create empty list for active players in the world
	this.players = {};

	//create tilemap for world
	this.world = new TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});

	//call builder to create the world in the tilemap
	this.builder[config.builder.name](this.world,config.builder);

	//create viewport for the visible part of the map
	this.viewport = new jaws.Viewport({
		max_x: config.mapWidth*config.blockSize, 
		max_y: config.mapHeight*config.blockSize
	});

	//create main player (controlled by keyboard)
	this.player = gameEngine.PlayerFactory({x: config.startPosX, y: config.startPosY, type: 'minenarbeiter', controllMode: ('ontouchstart' in document.documentElement?'touch':'keyboard')});

	this.player.smallInventory[0] = gameEngine.ItemFactory({type:"dirt",amount:"5"});
	this.player.smallInventory[2] = gameEngine.ItemFactory({type:"dirt",amount:"5"});
	this.player.smallInventory[6] = gameEngine.ItemFactory({type:"dirt",amount:"5"});
	this.player.smallInventory[7] = gameEngine.ItemFactory({type:"dirt",amount:"10"});
	this.player.smallInventory[8] = gameEngine.ItemFactory({type:"dirt",amount:"10"});

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
	} else {
		var mapChanges = gameEngine.get("mapChanges") || [];
		for(var i=0;i<mapChanges.length;i++) {
			var change = mapChanges[i];
			gameEngine.handleBlockChange(change);
		}
	}

};

//delegates game-logic, called every frame
gameEngine.update =  function() {
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
};

gameEngine.isInTolerance = function(a,b) {
	if(isNaN(a) || isNaN(b)) return false;
	return Math.abs(a - b) < config.positionUpdateTolerance;
}

gameEngine.handleInit = function(data) {
	gameEngine.myId = data.id;
	gameEngine.log("My ID is "+data.id);
	var lastChange = gameEngine.get("lastChange") || 0;
	if(data.startUp > lastChange) {
		gameEngine.log("server restarted after you left the game (or you've never visited the server), discarding local cache");
		gameEngine.set("mapChanges",[]);
	} else {
		var mapChanges = gameEngine.get("mapChanges") || [];
		for(var i=0;i<mapChanges.length;i++) {
			var change = mapChanges[i];
			gameEngine.handleBlockChange(change);
		}
	}
};

gameEngine.handleUpdate = function(data) {
	gameEngine.log('handle position-update');
	gameEngine.players[data.id].markDx = data.markDx;
	gameEngine.players[data.id].markDy = data.markDy;

	gameEngine.players[data.id].sprite.x = data.x;

	if(!gameEngine.isInTolerance(gameEngine.players[data.id].sprite.y, data.y)) {
		gameEngine.players[data.id].sprite.y = data.y;
		gameEngine.players[data.id].can_jump = false;
	}
};

gameEngine.handleNew = function(data) {
	if(data.id != gameEngine.myId) {
		gameEngine.log("add new player #"+data.id);
		var player = gameEngine.PlayerFactory({x: data.data.x, y: data.data.y, type: data.data.type, controllMode: 'none'});
		//add him to the players-list (activate him)
		gameEngine.players[data.id] = player;
	} else {
		gameEngine.log("add myself??! hell no");
	}
};

gameEngine.handleRemove = function(data) {
	gameEngine.log("remove player #"+data.id);
	gameEngine.players[data.id] = undefined;
};

gameEngine.handleBlockRemove = function(data) {
	gameEngine.log("block removed by other player: "+data.x+","+data.y);
	gameEngine.world.clearCell(data.x,data.y);
};

gameEngine.handleBlockChange = function(data) {
	gameEngine.log("block changed by other player: "+data.x+","+data.y);
	var lastChange = gameEngine.get("lastChange") || 0;
	if(lastChange < data.ts) {
		gameEngine.set("lastChange",data.ts);
	}
	gameEngine.world.clearCell(data.x,data.y);
	var newBlock = gameEngine.BlockFactory({x:data.x,y:data.y,type:data.type});
	gameEngine.world.push(newBlock.sprite);
};

gameEngine.possibleToPlantHere = function(x,y) {
	var left = gameEngine.world.cell(x-1,y);
	var right = gameEngine.world.cell(x+1,y);
	var above = gameEngine.world.cell(x,y-1);
	var bottom = gameEngine.world.cell(x,y+1);
	for(var i=0;i<left.length;i++) {
		if(left[i].block.staticInfo.collision) return true;
	}
	for(var i=0;i<right.length;i++) {
		if(right[i].block.staticInfo.collision) return true;
	}
	for(var i=0;i<above.length;i++) {
		if(above[i].block.staticInfo.collision) return true;
	}
	for(var i=0;i<bottom.length;i++) {
		if(bottom[i].block.staticInfo.collision) return true;
	}
	return false;
}

//method with drawing-logic - delegates into game-objects
gameEngine.draw = function() {
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
};

gameEngine.log = function(msg) {
	if(config.debug) {
		console.log(msg);
	}
}

if(localStorage === undefined) {
	gameEngine.localStorageFake = {};
	gameEngine.log("no local storage available, using fake");
}

gameEngine.get = function(key) {
	if(localStorage !== undefined) {
		return localStorage.getItem(key);
	}
	return gameEngine.localStorageFake[key];
}

gameEngine.set = function(key,value) {
	if(localStorage !== undefined) {
		localStorage.setItem(key,value);
	}
	gameEngine.localStorageFake[key] = value;
}

gameEngine.builder = {};
