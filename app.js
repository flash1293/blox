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
	mapWidth: 1000, //width of the complete map
	mapHeight: 100, //height of the complete map
	viewPortWidth: window.innerWidth, //width of the canvas-els
	viewPortHeight: window.innerHeight, //height of the canvas-els
	startPosX: 20, //start-position of the camera
	startPosY: 50, //end-position of the camera
	blockSize: 50, //size of a block in px
	cameraSpeed: 5, //speed of the camera per frame
	gravity: 1,
	builder: {
		name: 'normal',
		sinLength: 5.5,
		offset: 20,
		amplitude: 8,
		stoneLevel: 5
	},
	physicalFrameTime: 1000/60,
	assets: [
		"blocks/dirt.gif",
		"blocks/grass.gif",
		"blocks/stone.png",
		"agents/minenarbeiter.png"
	]
};


var gameEngine = {

	setup: function() {

		this.players = [];
		this.player = {};

		this.blocks = {};
		this.agents = {};
		this.agents.Minenarbeiter = function(x,y) {
			this.sprite = new jaws.Sprite({
				x: x,
				y: y,
				anchor: "center_bottom"	
			});
			this.sprite.player = this;

			var animation = new jaws.Animation({sprite_sheet: "assets/agents/minenarbeiter.png", frame_size: [50,100], frame_duration: 200});
			this.sprite.animations = {};
			this.sprite.animations.standright = animation.slice(0,1);
			this.sprite.animations.walkright = animation.slice(1,3);
			this.sprite.animations.standleft = animation.slice(3,4);
			this.sprite.animations.walkleft = animation.slice(4);

			this.dx = 0;
			this.dy = 0;

			this.displayMode = 'standright';
			this.oldDisplayMode = 'standright';

			this.gravitable = true;

			this.collidable = true;

			this.walkSpeed = 3;
			this.jumpHeight = 15;

			this.adjustDisplayMode = function() {
				this.oldDisplayMode = this.displayMode;
				if(this.dx > 0) this.displayMode = 'walkright';
				if(this.dx < 0) this.displayMode = 'walkleft';
				if(this.dx == 0) this.displayMode = ((this.oldDisplayMode == 'walkright' || this.oldDisplayMode == 'standright') ? 'standright' : 'standleft');
				this.sprite.setImage(this.sprite.animations[this.displayMode].next());
			};

			this.move = function() {

				this.sprite.x += this.dx;

				if(this.collidable) {
					var collisionBlocks = gameEngine.world.atRect(this.sprite.rect());
					for(var i=0;i<collisionBlocks.length;i++) {
						if(collisionBlocks[i].block.collision) {
							this.sprite.x -= this.dx;
							break;
						}
					}
				}
					
				this.sprite.y += this.dy;
	
				if(this.collidable) {
					var collisionBlocks = gameEngine.world.atRect(this.sprite.rect());
					for(var i=0;i<collisionBlocks.length;i++) {
						if(collisionBlocks[i].block.collision) {
							if(this.dy > 0) {
								this.can_jump = true;
								this.sprite.y = collisionBlocks[i].rect().y - 1;
							} else if(this.dy < 0) {
								this.sprite.y = collisionBlocks[i].rect().bottom + this.sprite.height;
							}
							this.dy = 0;
							break;
						}
					}
				}

				if(this.gravitable) this.dy += config.gravity;

			};		

		};

		this.blocks.DefaultBlock = function(that,x,y,sprite,name) {
			that.sprite = new jaws.Sprite({
				image: 'assets/blocks/'+sprite,
				scale: 1,
				anchor: 'top_left',
				x: x*config.blockSize,
				y: y*config.blockSize
			});
			that.sprite.block = that;
			that.x = x;
			that.y = y;
			that.name = name;
			that.health = 100;
			that.collision = true;
		};
		this.blocks.Dirt = function(x,y){
			gameEngine.blocks.DefaultBlock(this,x,y,'dirt.gif','dirt');
		};
		this.blocks.Grass = function(x,y){
			gameEngine.blocks.DefaultBlock(this,x,y,'grass.gif','grass');
		};
		this.blocks.Stone = function(x,y){
			gameEngine.blocks.DefaultBlock(this,x,y,'stone.png','stone');
		};
		this.world = new TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});
		this.builder[config.builder.name](this.world,config.builder);
		this.viewport = new jaws.Viewport({
			max_x: config.mapWidth*config.blockSize, 
			max_y: config.mapHeight*config.blockSize
		});

		this.player = new gameEngine.agents.Minenarbeiter(config.startPosX,config.startPosY);
		this.players.push(this.player);

		jaws.preventDefaultKeys(["up","down","left","right","space"]);
		this.viewport.moveTo(config.startPosX,config.startPosY);
		this.lastUpdate = Date.now();
	},
	
	update: function() {
		var currentTimeStamp = Date.now();
		for(var i=this.lastUpdate;i<currentTimeStamp;i=i+config.physicalFrameTime) {
			/*if(jaws.pressed("left"))  { this.viewport.move(-config.cameraSpeed,0);  }
			if(jaws.pressed("right")) { this.viewport.move(config.cameraSpeed,0);   }
			if(jaws.pressed("up"))    { this.viewport.move(0, -config.cameraSpeed); }
			if(jaws.pressed("down"))  { this.viewport.move(0, config.cameraSpeed);  }*/
			if(jaws.pressed("left"))  { this.player.dx = -this.player.walkSpeed; }
		        else if(jaws.pressed("right")) { this.player.dx = this.player.walkSpeed; }
			else (this.player.dx = 0);
		        if(jaws.pressed("up"))    { if(this.player.can_jump) { this.player.dy = -this.player.jumpHeight; this.player.can_jump = false; } }
			for(var j=0;j<this.players.length;j++) {
				this.players[j].move();
				this.players[j].adjustDisplayMode();	
			}
		}
		this.viewport.centerAround(this.player.sprite);
		this.lastUpdate = currentTimeStamp;
	},

	draw: function() {
		jaws.clear();
		this.viewport.drawTileMap(this.world);

		this.viewport.apply( function() {
			for(var i=0;i<gameEngine.players.length;i++) {
				if(gameEngine.viewport.isPartlyInside(gameEngine.players[i].sprite)) gameEngine.players[i].sprite.draw();
			}
		});
	},

	builder: {
		normal: function(map,conf) {
			for(var i=0;i<config.mapWidth;i++) {
				var topLevel = Math.floor(Math.sin(i/conf.sinLength)*conf.amplitude+conf.offset);
				for(var j=topLevel;j<config.mapHeight;j++) {
					var block;
					if(j==topLevel) block = new gameEngine.blocks.Grass(i,j);
					else if(j>(topLevel+conf.stoneLevel)) block = new gameEngine.blocks.Stone(i,j);
					else block = new gameEngine.blocks.Dirt(i,j);
					map.push(block.sprite);
				}
			}
			
			var block = new gameEngine.blocks.Dirt(3,4);
			map.push(block.sprite);
			
		}
	}
};


jaws.onload = function() {
	jaws.unpack();
	config.assets.forEach(function(item) {
		jaws.assets.add(["assets/"+item]);
	});
	jaws.start(gameEngine,{bgcolor: 'skyblue', width: config.viewPortWidth, height: config.viewPortHeight});
    }
