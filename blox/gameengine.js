Object.prototype.foreach = function( callback ) {
    for( var k in this ) {
        if(this.hasOwnProperty(k) && this[k] != undefined) {
           callback( k, this[ k ] );
        }
    }
}

var saws = require('./saws');
var builder = require('../public/src/Builder');
var config = require('../public/config');
var contents = {
	players: require('../public/assets/players.json'),
	tools: require('../public/assets/tools.json'),
	blocks: require('../public/assets/blocks.json'),
};
var lastUpdate = Date.now();
var players = {};
var world = new saws.TileMap({size: [config.mapWidth, config.mapHeight], cell_size: [config.blockSize,config.blockSize]});
var socketEmitter = {};

world.getBlockAt = function(x,y) {
	var sprites = this.cell(x,y);
	return sprites[0].block;
};

world.replaceBlockAt = function(x,y,type) {
	this.clearCell(x,y);
	var newBlock = {x:x,y:y,type:type};
	newBlock.staticInfo = contents.blocks[type];
	newBlock.sprite = new saws.Sprite({
		width: config.blockSize,
		height: config.blockSize,
		scale: 1,
		anchor: 'top_left',
		x: x*config.blockSize,
		y: y*config.blockSize
	});
	newBlock.sprite.block = newBlock;
	this.push(newBlock.sprite);
};

builder[config.builder.name](config.mapWidth, config.mapHeight, world, config.builder);

function IntPlayer(options) {
	
	//create a sprite-object for the this
	this.sprite = new saws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom",
			width: 50,
			height: 100	
	});
	
	this.dx = 0;
	this.dy = 0;
	this.markDx = 0;
	this.markDy = 0;
	
	this.staticInfo = contents.players[options.type];

	//if the this has a default-tool, create it and link it to the this-object
	this.tool = {
		type: this.staticInfo.defaultTool,
		staticInfo: contents.tools[this.staticInfo.defaultTool]
	};

	//set back-reference from sprite to this-object
	this.sprite.player = this;

	this.active = true;
	
	this.controllMode = options.controllMode;
	
	this.behave = require('./ki')[this.controllMode];
	this.lastMove = Date.now();

	this.move = function() {
		this.sprite.x += this.dx;
	
		//if the player can collide with blocks
		if(this.staticInfo.collidable) {
			var collisionBlocks = world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
			for(var i=0;i<collisionBlocks.length;i++) {
	
				//if the block is a solid block (causes a collision)
				if(collisionBlocks[i].block.staticInfo.collision) {
					this.sprite.x -= this.dx;
					break;
				}
			}
		}
			
		this.sprite.y += this.dy;
	
		//if the player can collide with blocks
		if(this.staticInfo.collidable) {
			var collisionBlocks = world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
			for(var i=0;i<collisionBlocks.length;i++) {
	
				//if the block is a solid block (causes a collision)
				if(collisionBlocks[i].block.staticInfo.collision) {
	
					//if player hit the ground
					if(this.dy > 0) {
						//it is able to jump
						this.can_jump = true;
						this.sprite.y = collisionBlocks[i].rect().y - 1;
						if(this.staticInfo.fallDamage > 0 && this.staticInfo.fallDamageLimit < this.dy) {
							var damage = this.dy / 10;
							damage *= this.staticInfo.fallDamage;
							this.health -= damage;
						}
					} else if(this.dy < 0) {
						this.sprite.y = collisionBlocks[i].rect().bottom + this.sprite.height;
					}
					this.dy = 0;
					break;
				}
			}
		}
	
		//if the player is influenced by gravity, calculate gravity in the y-movement-vector
		if(this.isGravityDisabled()) {
			this.can_jump = true;
			if(this.dy < -this.staticInfo.climbV) this.dy = -this.staticInfo.climbV;
			else if(this.dy > this.staticInfo.climbDownV) this.dy = this.staticInfo.climbDownV;
		} else {
			if(this.staticInfo.gravitable) this.dy += config.gravity;
		}
		this.sprite.x = Math.floor(this.sprite.x);
		this.sprite.y = Math.floor(this.sprite.y);
	};
	
	this.isGravityDisabled = function() {
		var gravityDisabled = false;
		var collisionBlocks = world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
		for(var i=0;i<collisionBlocks.length;i++) { if(collisionBlocks[i].block.staticInfo.disableGravity) gravityDisabled = true; }
		return gravityDisabled;
	};
	
	this.applyMovement = function() {
		var gravityDisabled = this.isGravityDisabled();
		this.dx = this.markDx;
		if(this.markDy == -this.staticInfo.jumpHeight && gravityDisabled) this.markDy = -this.staticInfo.climbV;  
		if(this.markDy < 0 && this.can_jump) {
			this.dy = this.markDy;
			if(!gravityDisabled) this.can_jump = false;
		} else if(this.markDy > 0){
			this.dy = this.markDy;
		}
	};
	
	this.update = function() {
		var that = this;
		if(this.myId === undefined) return;
		if(this.markDx == this.markDxOld && this.markDy == this.markDyOld) return;
		socketEmitter(function(otherPlayer) {
			otherPlayer.socket.emit('update', 
			{ 
				id: that.myId, 
				markDx: that.markDx, 
				markDy: that.markDy, 
				x: that.sprite.x, 
				y: that.sprite.y 
			});
		});
		this.markDxOld = this.markDx;
		this.markDyOld = this.markDy;
	};
	
	this.setData = function(data) {
		this.markDx = data.markDx;
		this.markDy = data.markDy;
	
		this.sprite.x = data.x;
		this.sprite.y = data.y;
		this.can_jump = false;
	};
}

setInterval(function() {
	var currentTimeStamp = Date.now();
	for(var i=lastUpdate;i<currentTimeStamp;i=i+config.physicalFrameTime) {
		players.foreach(function(id, player){
			if(player.controllMode != "remote") {
				player.behave();
				player.update();
			}
			player.applyMovement();
			player.move();	
		});
	}
	lastUpdate = currentTimeStamp;
},16.666);


module.exports = {
	addPlayer: function(id,player) {
		var newPlayer = new IntPlayer(player);
		newPlayer.myId = id;
		players[id] = newPlayer;
	},
	removePlayer: function(id) {
 		delete players[id];
	},
	updatePlayer: function(id,data) {
		players[id].setData(data);
	},
	updateBlock: function(data) {
		world.replaceBlockAt(data.x, data.y, data.type);
	},
	setEmitter: function(emitter) {
		socketEmitter = emitter;
	}
};
