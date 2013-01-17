//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


//various configs for the game-engine
var config = {
	mapWidth: 100, //width of the complete map
	mapHeight: 100, //height of the complete map
	viewPortWidth: window.innerWidth, //width of the canvas-els
	viewPortHeight: window.innerHeight, //height of the canvas-els
	startPosX: 0, //start-position of the camera
	startPosY: 0, //end-position of the camera
	blockSize: 50, //size of a block in px
	cameraSpeed: 10, //speed of the camera per frame
	builder: 'normal'
};


var gameEngine = {

	setup: function() {
		this.blocks = {};
		this.blocks.dirt = {image: 'tile.jpg', scale: 1, anchor: 'top_left'};
		this.world = new TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});
		this.builder[config.builder](this.world);
		this.viewport = new jaws.Viewport({
			max_x: config.mapWidth*config.blockSize, 
			max_y: config.mapHeight*config.blockSize
		});
		jaws.preventDefaultKeys(["up","down","left","right","space"]);
		this.viewport.moveTo(config.startPosX,config.startPosY);

	},
	
	update: function() {
		if(jaws.pressed("left"))  { this.viewport.move(-config.cameraSpeed,0);  }
		if(jaws.pressed("right")) { this.viewport.move(config.cameraSpeed,0);   }
		if(jaws.pressed("up"))    { this.viewport.move(0, -config.cameraSpeed); }
		if(jaws.pressed("down"))  { this.viewport.move(0, config.cameraSpeed);  }
		console.log(jaws.game_loop.fps);

	},

	draw: function() {
		jaws.clear();
		this.viewport.drawTileMap(this.world);
	},

	builder: {
		normal: function(map) {
			for(var i=0;i<config.mapWidth;i++) {
				for(var j=6;j<config.mapHeight;j++) {
					var options = gameEngine.blocks.dirt;
					options.x = i*config.blockSize;
					options.y = j*config.blockSize
					map.push(new jaws.Sprite(options));
				}
			}
			
			var options = gameEngine.blocks.dirt;
			options.x = 3*config.blockSize;
			options.y = 4*config.blockSize
			map.push(new jaws.Sprite(options));
		}
	}
};


jaws.onload = function() {
      jaws.unpack()
      jaws.assets.add(["tile.jpg"])
      jaws.start(gameEngine,{width: config.viewPortWidth, height: config.viewPortHeight})  // Our convenience function jaws.start() will load assets, call setup and loop update/draw in 60 FPS
    }
