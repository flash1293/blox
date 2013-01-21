//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};



//create global main-object
var gameEngine = {};

//setup method - called once
gameEngine.setup = function() {

	//create empty list for active players in the world
	this.players = [];

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
	this.player = gameEngine.PlayerFactory({x: config.startPosX, y: config.startPosY, type: 'minenarbeiter', controllMode: 'keyboard'});
	//add him to the players-list (activate him)
	this.players.push(this.player);

	//probably useless
	jaws.preventDefaultKeys(["up","down","left","right","space"]);

	//initialize viewport-position (probably useless)
	this.viewport.moveTo(config.startPosX,config.startPosY);

	//timestamp-check for fps-independent game-logic
	this.lastUpdate = Date.now();
};
	
//delegates game-logic, called every frame
gameEngine.update =  function() {
	var currentTimeStamp = Date.now();
	//get independent from game-logic (important for slow pcs and multiplayer)
	for(var i=this.lastUpdate;i<currentTimeStamp;i=i+config.physicalFrameTime) {
		//iterate all players 
		for(var j=0;j<this.players.length;j++) {
			//make a descision for next move (input= ki/keyboard/...)
			this.players[j].controll();
			//move the player resp. to its vector-values (collision-check etc.)
			this.players[j].move();
			//adjust the used sprite for the player
			this.players[j].adjustDisplayMode();	
		}
	}
	//adjust position of the viewport
	this.viewport.centerAround(this.player.sprite);
	//for fps-independet game-logic
	this.lastUpdate = currentTimeStamp;
};

//method with drawing-logic - delegates into game-objects
gameEngine.draw = function() {
	//clear canvas
	jaws.clear();
	//draw map
	this.viewport.drawTileMap(this.world);

	//draw players
	this.viewport.apply( function() {
		for(var i=0;i<gameEngine.players.length;i++) {
			//if they are inside the viewport
			if(gameEngine.viewport.isPartlyInside(gameEngine.players[i].sprite)) gameEngine.players[i].draw();
		}
	});
};

gameEngine.builder = {};


