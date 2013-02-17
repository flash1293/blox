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
        if(this.hasOwnProperty(k)) {
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
	//add him to the players-list (activate him)
	this.players[0] = this.player;

	//probably useless
	jaws.preventDefaultKeys(["up","down","left","right","space"]);

	//initialize viewport-position (probably useless)
	this.viewport.moveTo(config.startPosX,config.startPosY);

	//timestamp-check for fps-independent game-logic
	this.lastUpdate = Date.now();
	
	socket.emit('register',{type: gameEngine.player.type});

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

gameEngine.handleInit = function(data) {
	gameEngine.myId = data.id;
};

gameEngine.handleUpdate = function(data) {
	gameEngine.players[data.id].dx = data.dx;
	gameEngine.players[data.id].dy = data.dy;
	gameEngine.players[data.id].sprite.x = data.x;
	gameEngine.players[data.id].sprite.y = data.y;
};

gameEngine.handleNew = function(data) {
	if(data.id != gameEngine.myId) {
		var player = gameEngine.PlayerFactory({x: data.data.x, y: data.data.y, type: data.data.type, controllMode: 'none'});
		//add him to the players-list (activate him)
		gameEngine.players[data.id] = player;
	}
};

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

gameEngine.builder = {};
