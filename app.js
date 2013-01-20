//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};



var gameEngine = {};

gameEngine.setup = function() {

	this.players = [];

	this.world = new TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});
	this.builder[config.builder.name](this.world,config.builder);
	this.viewport = new jaws.Viewport({
		max_x: config.mapWidth*config.blockSize, 
		max_y: config.mapHeight*config.blockSize
	});

	this.player = gameEngine.PlayerFactory({x: config.startPosX, y: config.startPosY, type: 'minenarbeiter', controllMode: 'keyboard'});
	this.players.push(this.player);

	jaws.preventDefaultKeys(["up","down","left","right","space"]);
	this.viewport.moveTo(config.startPosX,config.startPosY);
	this.lastUpdate = Date.now();
};
	
gameEngine.update =  function() {
	var currentTimeStamp = Date.now();
	for(var i=this.lastUpdate;i<currentTimeStamp;i=i+config.physicalFrameTime) {
		for(var j=0;j<this.players.length;j++) {
			this.players[j].controll();
			this.players[j].move();
			this.players[j].adjustDisplayMode();	
		}
	}
	this.viewport.centerAround(this.player.sprite);
	this.lastUpdate = currentTimeStamp;
};

gameEngine.draw = function() {
	jaws.clear();
	this.viewport.drawTileMap(this.world);

	this.viewport.apply( function() {
		for(var i=0;i<gameEngine.players.length;i++) {
			if(gameEngine.viewport.isPartlyInside(gameEngine.players[i].sprite)) gameEngine.players[i].draw();
		}
	});
};

gameEngine.builder = {};


