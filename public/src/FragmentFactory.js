gameEngine = gameEngine || {};
/**
* A class for all flying pieces of something (danger - could explode)
*
* @module Blox
* @submodule Game
* @class Fragment
* @constructor
* @param {Object} options The options of the fragment. type: the type of the fragment, 
* 	x: the x-coordinate of the fragment (in px), y: the y-coordinate of the fragment (in px),
*   dx: the initial x-movement, dy: the inital y-movement
*/
gameEngine.Fragment = function(options) {
	//initialize movement-vectors
	this.dx = options.dx;
	this.dy = options.dy;

	//load static info from thiss.json
	this.staticInfo = jaws.assets.get("assets/players.json")[options.type];

	//create a sprite-object for the this
	this.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center"	
	});
    
	if(this.staticInfo.spriteType == "static") {

		//create sprite and slice it to modes (stand, walk)
		var animation = new jaws.Animation({sprite_sheet: "assets/fragments/"+this.staticInfo.sprite_sheet, frame_size: [this.staticInfo.spriteHeight,this.staticInfo.spriteWidth], frame_duration: 100});
		this.sprite.animations = {};
		this.sprite.animations.faceright = animation.slice(0,1);
		this.sprite.animations.faceleft = animation.slice(1,2);

		//set the displaymode resp. to movement-vectors and probably adjusts the displaymode of the tool
		this.adjustDisplayMode = function() {
			this.oldDisplayMode = this.displayMode;
			if(this.dx > 0) this.displayMode = 'faceright';
			if(this.dx < 0) this.displayMode = 'faceleft';
            this.sprite.setImage(this.sprite.animations[this.displayMode].next());
		};
	}
    
};

/**
* Fragment collided - checking for explosion-damage etc.
*
* @method explode
*/
gameEngine.Fragment.prototype.explode = function() {
};

/**
* Moves the current fragment and handles collision etc.
*
* @method move
*/
gameEngine.Fragment.prototype.move = function() {
	this.sprite.x += this.dx;

	//if the player can collide with blocks
	if(this.staticInfo.collidable) {
		var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
		for(var i=0;i<collisionBlocks.length;i++) {

			//if the block is a solid block (causes a collision)
			if(collisionBlocks[i].block.staticInfo.collision) {
				this.sprite.x -= this.dx;
                this.explode();
				break;
			}
		}
	}
		
	this.sprite.y += this.dy;

	//if the player can collide with blocks
	if(this.staticInfo.collidable) {
		var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
		for(var i=0;i<collisionBlocks.length;i++) {

			//if the block is a solid block (causes a collision)
			if(collisionBlocks[i].block.staticInfo.collision) {
                this.explode();
			}
		}
	}

	this.sprite.x = Math.floor(this.sprite.x);
	this.sprite.y = Math.floor(this.sprite.y);
};


gameEngine.Fragment.prototype.draw = function() {
	this.sprite.draw();
};