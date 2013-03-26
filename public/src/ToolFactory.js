gameEngine = gameEngine || {};
/**
* A class for the tools of the players
*
* @module Blox
* @submodule Game
* @class Tool
* @constructor
* @param {Object} options The options of the Tool. type: The type of the tool
* @param {Player} carrier the player holding the tool
*/
gameEngine.Tool = function(options, carrier) {
	var that = this;
	//back-reference to this-holding player
	this.carrier = carrier;

	//the name of the this (id in thiss.json)
	this.name = options.type;

	//all static parameters about this this (got from thiss.json)
	this.staticInfo = jaws.assets.get("assets/tools.json")[options.type];
	

	//temp. var for the sprite-options for this this for this carrier
	var spriteOptions = this.staticInfo.sprite[options.carrier];
	
	//create sprite-object
	this.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor_x: spriteOptions.anchor_x,
			anchor_y: spriteOptions.anchor_y
	});


	//cache offset-values (resp. to the player) and anchor-points(for rotation of the this)
	this.sprite.yFixOffset = (1-spriteOptions.anchor_y)*spriteOptions.frameSize[1];
	this.sprite.xFixOffsetRight = (spriteOptions.anchor_x/2)*spriteOptions.frameSize[0];
	this.sprite.xFixOffsetLeft = -(spriteOptions.anchor_x/2)*spriteOptions.frameSize[0];
	this.sprite.xAnchorRight = spriteOptions.anchor_x;
	this.sprite.xAnchorLeft = (1-spriteOptions.anchor_x);


	//load sprite and splice it to hold and active-modes
	var animation = new jaws.Animation({sprite_sheet: "assets/tools/"+options.type+"/"+spriteOptions.sprite_sheet, frame_size: spriteOptions.frameSize, frame_duration: spriteOptions.duration});
	this.sprite.animations = {};
	this.sprite.animations.holdright = animation.slice(0,1);
	this.sprite.animations.activeright = animation.slice(0,spriteOptions.frameCount);
	this.sprite.animations.holdleft = animation.slice(spriteOptions.frameCount,spriteOptions.frameCount+1);
	this.sprite.animations.activeleft = animation.slice(spriteOptions.frameCount);
	this.sprite.animations.activeright.loop = false;
	this.sprite.animations.activeleft.loop = false;

	//if the active-animation is done, set active to false and reset the index-value
	//if the player is still active, it will be resetted by the player-command-function
	this.sprite.animations.activeright.on_end = function() {
		that.active = false;
	    this.index = 0;
	}
	this.sprite.animations.activeleft.on_end = function() { 
		that.active = false;
	    this.index = 0;
	}

};


/**
* method to determine the right animation to display
* @method adjustDisplayMode
*/
gameEngine.Tool.prototype.adjustDisplayMode = function() {
	if(this.carrier.displayMode == "standright" || this.carrier.displayMode == "walkright") {
		this.displayMode = this.active ? "activeright" : "holdright";
	}
	if(this.carrier.displayMode == "standleft" || this.carrier.displayMode == "walkleft") {
		this.displayMode = this.active ? "activeleft" : "holdleft";
	}
	this.sprite.setImage(this.sprite.animations[this.displayMode].next());
	//set x-anchor new so tool is in the right position after the direction-change 
	this.sprite.anchor_x = ((this.displayMode == "activeleft" || this.displayMode == "holdleft")?this.sprite.xAnchorLeft:this.sprite.xAnchorRight);
	//adjust angle of the tool resp. to mouse-position
	if(this.staticInfo.rotatable && this.carrier.controllMode == "keyboard") {	
		var x = jaws.mouse_x+gameEngine.viewport.x-gameEngine.player.sprite.x;
		var y = jaws.mouse_y+gameEngine.viewport.y-gameEngine.player.sprite.y+this.sprite.yFixOffset;
		if(x < 0) x *= -1;
		var angle = Math.atan(y/x) * (180/Math.PI);
		this.sprite.rotateTo(((this.displayMode == "activeleft" || this.displayMode == "holdleft")?-angle:angle));
	}
};

/**
* method to handle the left-click action
* @method handleAction
*/
gameEngine.Tool.prototype.handleAction = function (){
	if(this.staticInfo.isDiggingTool) {
		var block = this.getClickedBlock();
		if(block == undefined) return;
		if(block.staticInfo.diggable) {
			block.health -= this.staticInfo.damage;
			if(block.health <= 0) {
				block.consume(this.carrier);
				gameEngine.world.clearCell(block.x,block.y);
				var newBlock = gameEngine.BlockFactory({x:block.x,y:block.y,type:'void'});
				gameEngine.world.push(newBlock.sprite);
				if(config.multiplayer) {
					socket.emit('changeblock',{
						x: block.x,
						y: block.y,
						type: 'void',
						ts: Date.now()
					});
					gameEngine.set("lastChange",Date.now());
				}
				var mapChanges = gameEngine.get("mapChanges") || [];
				mapChanges.push({x: block.x, y:block.y, type: 'void', ts: Date.now()});
				gameEngine.set("mapChanges",mapChanges);
				gameEngine.log("you removed block "+block.x+","+block.y);
			}
		}
	}
}

/**
* method to handle the plant(right-click) action
* @method handlePlantAction
*/
gameEngine.Tool.prototype.handlePlantAction = function (){
	var that = this;
	var item = this.carrier.getCurrentItem();
	if(this.staticInfo.canPlantBlocks && item !== undefined && item.staticInfo.toBlock !== undefined) {
		var block = this.getClickedBlock();
		this.playerInBlock = false;
		var targetBlock = jaws.assets.get("assets/blocks.json")[item.staticInfo.toBlock];
		if(targetBlock.collision) {
			gameEngine.players.foreach(function(id, player){
				var collisionBlocks = gameEngine.world.atRect(that.carrier.sprite.rect().shrink(config.hitBoxOffset));
				for(var i=0;i<collisionBlocks.length;i++) {
					if(collisionBlocks[i].block == block) {
						gameEngine.log("you could plant, but player stands in the block..");
						that.playerInBlock = true;
					}
				}
			});
		}

		if(this.playerInBlock) return;


		if(block == undefined) return;
		
		if(!gameEngine.possibleToPlantHere(block.x,block.y)) {
			gameEngine.log("you cant plant here - no anchor");
			return;
		}
		
		if(block.staticInfo.replaceable) {
			gameEngine.world.clearCell(block.x,block.y);
			var newBlock = gameEngine.BlockFactory({x:block.x,y:block.y,type:item.staticInfo.toBlock});
			gameEngine.world.push(newBlock.sprite);
			if(config.multiplayer) {
				socket.emit('changeblock',{
					x: block.x,
					y: block.y,
					type: item.staticInfo.toBlock,
					ts: Date.now()
				});
				gameEngine.set("lastChange",Date.now());
			}
			var mapChanges = gameEngine.get("mapChanges") || [];
			mapChanges.push({x: block.x, y:block.y, type: item.staticInfo.toBlock, ts: Date.now()});
			gameEngine.set("mapChanges",mapChanges);
			gameEngine.log("you planted block "+block.x+","+block.y);
			this.carrier.decreaseCurrentItem(1);
			gameEngine.touchPlace = false;
			$('#placenow').hide();
		}

	}
}

/**
* method to determine the currently clicked (or touched) block
* @method getClickedBlock
* @return {Block} the currently clicked or touched block
*/
gameEngine.Tool.prototype.getClickedBlock = function() {
	var collisionBlocks = gameEngine.world.atRect(new jaws.Rect(gameEngine.viewport.x+jaws.mouse_x,gameEngine.viewport.y+jaws.mouse_y,1,1));

	var blocksInRange = gameEngine.world.atRect(this.carrier.sprite.rect().inflate(this.staticInfo.range));

	for(var i=0;i<collisionBlocks.length;i++) {
		for(var j=0;j<blocksInRange.length;j++) {
			if(collisionBlocks[i].block != undefined && collisionBlocks[i].block == blocksInRange[j].block) return collisionBlocks[i].block;
		}
	}

};

/**
* draw the tool resp. to the player holding it
* @method draw
*/
gameEngine.Tool.prototype.draw = function() {
	this.sprite.x = this.carrier.sprite.x-((this.displayMode == "activeleft" || this.displayMode == "holdleft")?this.sprite.xFixOffsetLeft : this.sprite.xFixOffsetRight);
	this.sprite.y = this.carrier.sprite.y-this.sprite.yFixOffset;
	this.sprite.draw();
}


/*
 * example options-object:
 * type: type/name of the tool (loads static parameters from tools.json)
 * */
gameEngine.ToolFactory = function(options, carrier){
	return new gameEngine.Tool(options, carrier);
};
