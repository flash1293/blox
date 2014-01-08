gameEngine = gameEngine || {};
/**
* A class for all active instances in the game
*
* @module Blox
* @submodule Game
* @class Player
* @constructor
* @param {Object} options The options of the player. type: the type of the player, 
* 	x: the x-coordinate of the player (in px), y: the y-coordinate of the player (in px)
*/
gameEngine.Player = function(options) {
	//initialize movement-vectors
	this.dx = 0;
	this.dy = 0;

	this.type = options.type;

	this.smallInventory = new Array(9);

	this.selectedItem = 0;
	
	this.bigInventory = new Array(36);

	//set controllmode of the this (keyboard, ki or remote)
	this.controllMode = options.controllMode;
	
	this.behave = gameEngine.controllers[options.controllMode];
	if(this.behave === undefined) this.behave = function() {};

	//load static info from thiss.json
	this.staticInfo = jaws.assets.get("assets/players.json")[options.type];

	this.health = this.staticInfo.health;

	//create a sprite-object for the this
	this.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom"	
	});

	//if the this has a default-tool, create it and link it to the this-object
	if(this.staticInfo.defaultTool != undefined) {
		this.tool = gameEngine.ToolFactory({type: this.staticInfo.defaultTool, carrier: options.type, x: options.x, y: options.y}, this);
	}

	//set back-reference from sprite to this-object
	this.sprite.player = this;

	//initialize the start-displaymode of the this
	this.displayMode = this.staticInfo.startDisplayMode;
	this.oldDisplayMode = this.staticInfo.startDisplayMode;

	//if the this is a human (2x1 block hitbox and is walking)
	if(this.staticInfo.typeClass == "human") {

		//create sprite and slice it to modes (stand, walk)
		var animation = new jaws.Animation({sprite_sheet: "assets/agents/"+this.staticInfo.sprite_sheet, frame_size: [50,100], frame_duration: 100});
		this.sprite.animations = {};
		this.sprite.animations.standright = animation.slice(0,1);
		this.sprite.animations.walkright = animation.slice(1,7);
		this.sprite.animations.standleft = animation.slice(7,8);
		this.sprite.animations.walkleft = animation.slice(8);

		//set the displaymode resp. to movement-vectors and probably adjusts the displaymode of the tool
		this.adjustDisplayMode = function() {
			this.oldDisplayMode = this.displayMode;
			if(this.dx > 0) this.displayMode = 'walkright';
			if(this.dx < 0) this.displayMode = 'walkleft';
			if(this.dx == 0) this.displayMode = ((this.oldDisplayMode == 'walkright' || this.oldDisplayMode == 'standright') ? 'standright' : 'standleft');
			this.sprite.setImage(this.sprite.animations[this.displayMode].next());

			if(this.tool != undefined) this.tool.adjustDisplayMode();
		};
	}
	this.lastUpdate = Date.now();
}

/**
* Applies one action-tick of the player (moving, planting, attacking etc.)
* @method controll
*/
gameEngine.Player.prototype.controll = function() {		
	this.behave();
	this.applyMovement();
	if(config.multiplayer && this.controllMode != "none") {
		this.update();
	}
};

/**
* Populates changes in the controll to the server
*
* @method update
*/
gameEngine.Player.prototype.update = function() {
	if(gameEngine.myId === undefined) return;
	if(this.markDx == this.markDxOld && this.markDy == this.markDyOld) return;
	socket.emit('update', 
		{ 
			id: gameEngine.myId, 
			markDx: this.markDx, 
			markDy: this.markDy, 
			x: this.sprite.x, 
			y: this.sprite.y 
		}
	);
	this.markDxOld = this.markDx;
	this.markDyOld = this.markDy;
	gameEngine.log("update!");
};

/**
* Adds an amount of items to the inventory. If there is no place, it gets thrown away
*
* @method addItemsToInventory
* @param {String} type The type of item (e.g. ladder)
* @param {Integer} amount The amount of *type*-items, e.g. 5
* @return {Boolean} Returns true on success
*/
gameEngine.Player.prototype.addItemsToInventory = function(type,amount) {
	for(var i=0;i<9;i++) {
		var item = this.smallInventory[i];
		if(item === undefined) {
			gameEngine.log("found empty slot, creating new item-stack");
			this.smallInventory[i] = gameEngine.ItemFactory({type: type, amount: amount});
			gameEngine.hud.updateItembox();
			return true;
		}
		if(item.type == type && Number(item.staticInfo.maxAmount) >= (Number(item.amount) + Number(amount))) {
			gameEngine.log("found slot with same item-type, adding them up");
			this.smallInventory[i].amount = Number(this.smallInventory[i].amount) + Number(amount);
			gameEngine.hud.updateItembox();
			return true;
		}
		if(item.type == type) {
			gameEngine.log("found slot with same item-type, but amount would be too high");
		}
	}	
	gameEngine.log("item got lost because inventory is full");
	return false;
};

/**
* Moves an item from one inventory-slot to another (if there is not enough space (maxAmount), only partially)
*
* @method moveItemFromSlotToSlot
* @param {Integer} the index of the source-slot
* @param {Boolean} whether the source-slot is in the big inventory or not
* @param {Integer} the index of the target-slot
* @param {Boolean} whether the target-slot is in the big inventory or not
*/
gameEngine.Player.prototype.moveItemFromSlotToSlot = function(fromIndex,isFromBigInventory,toIndex,isToBigInventory) {
	//if droped in same slot
	if(fromIndex == toIndex && isFromBigInventory == isToBigInventory) return;

	var fromInventory = (isFromBigInventory ? this.bigInventory : this.smallInventory);
	var toInventory = (isToBigInventory ? this.bigInventory : this.smallInventory);

	//if target-slot is empty;
	if(typeof toInventory[toIndex] != "object") {
		toInventory[toIndex] = fromInventory[fromIndex];
		fromInventory[fromIndex] = undefined;
		gameEngine.hud.updateItembox(isFromBigInventory || isToBigInventory);
		return;
	}

	var fromItem = fromInventory[fromIndex];
	var toItem = toInventory[toIndex];

	//if item-types doesn't match
	if(fromItem.type != toItem.type) return;


	if(fromItem.amount+toItem.amount > fromItem.staticInfo.maxAmount) {
		//split items
		var transferAmount = fromItem.staticInfo.maxAmount - toItem.amount;
		fromItem.amount -= transferAmount;
		toItem.amount += transferAmount;
	} else {
		//complete transaction
		toItem.amount += fromItem.amount;
		fromInventory[fromIndex] = undefined;
	}

	gameEngine.hud.updateItembox(isFromBigInventory || isToBigInventory);
};

/**
* Removes an item from the inventory and updates it in the HUD
*
* @method removeItem
* @param {Integer} the index of the item-slot
* @param {Boolean} whether the item-slot is in the big inventory or not
*/
gameEngine.Player.prototype.removeItem = function(index,isBigInventory) {
    var inventory = (isBigInventory ? this.bigInventory : this.smallInventory);
    inventory[index] = undefined;
    gameEngine.hud.updateItembox(isBigInventory);
};

/**
* Returns the current selected Item
*
* @method getCurrentItem
* @return {Item} Returns the current selected Item
*/
gameEngine.Player.prototype.getCurrentItem = function() {
	return this.smallInventory[this.selectedItem];
};

/**
* Decreases the currently selected item by a specified amount. Updates the HUD
*
* @method decreaseCurrentItem
* @param {Integer} amount The amount which gets decreased
*/
gameEngine.Player.prototype.decreaseCurrentItem = function(amount) {
	gameEngine.log("decreasing current item-stack by "+amount);
	var item = this.getCurrentItem();
	item.amount = Number(item.amount)-Number(amount);
	if(item.amount < 1) { 
		this.smallInventory[this.selectedItem] = undefined; 
		gameEngine.log("stack is empty, got removed");
	}
	gameEngine.hud.updateItembox();
};

/**
* Applies the wished movement to the vectors if possible
*
* @method applyMovement
*/
gameEngine.Player.prototype.applyMovement = function() {
	this.dx = this.markDx;
	if(this.markDy < 0 && this.can_jump) {
		this.dy = this.markDy;
		if(!this.isGravityDisabled()) this.can_jump = false;
	} else if(this.markDy > 0){
		this.dy = this.markDy;
	}
};

/**
* Sets the health of a player to a specified value
*
* @method setHealth
* @param {Integer} health The new health-value of the player
*/
gameEngine.Player.prototype.setHealth = function(value) {
	this.health = value;
	gameEngine.log("player-damage:"+value);
	if(this.hasHealthBar) {
		gameEngine.hud.setHealthTo(value/this.staticInfo.health);
	}
};

/**
* Prompts a chat-windows and sends the message to the server. Use it as click-handler
*
* @method chat
*/
gameEngine.Player.prototype.chat = function(ev) {
	gameEngine.log("entering chat-message");
	var msg = prompt("Enter Message:","");
	if(msg) {
		socket.emit('chat', {player: '#'+gameEngine.myId, msg: msg });
	}
};

/**
* Draws the player using the jaws-Framework. Escalates to tool etc.
*
* @method draw
*/
gameEngine.Player.prototype.draw = function() {
	this.sprite.draw();
	if(this.tool != undefined && this.tool.staticInfo.visible) this.tool.draw();
};
	
/**
* Checks whether the gravityis disabled for the current player because of ladders etc.
*
* @method isGravityDisabled
*/
gameEngine.Player.prototype.isGravityDisabled = function() {
	var gravityDisabled = false;
	var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
	for(var i=0;i<collisionBlocks.length;i++) { if(collisionBlocks[i].block.staticInfo.disableGravity) gravityDisabled = true; }
	return gravityDisabled;
};

/**
* Teleports the player to a certain position
*
* @method teleport
* @param {Integer} x the x-coordinate
* @param {Integer} y the y-coordinate
*/
gameEngine.Player.prototype.teleport = function(x,y) {
	this.sprite.x = x*config.blockSize;
	this.sprite.y = y*config.blockSize;
};

/**
* Moves the current player and handles collision etc.
*
* @method move
*/
gameEngine.Player.prototype.move = function() {
	this.sprite.x += this.dx;

	//if the player can collide with blocks
	if(this.staticInfo.collidable) {
		var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
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
		var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
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
						this.setHealth(this.health-damage);
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

/**
* Sets the small inventory by a matrix = [["type1",amount1],["type2",amount2],...]
*
* @method setInventory
* @param {Array} inventory the data-matrix
*/
gameEngine.Player.prototype.setInventory = function(inventory) {
	var that = this;
	inventory.foreach(function(key,item) {
		that.smallInventory[key] = gameEngine.ItemFactory({type:item[0],amount:item[1]});
	});
};

/**
* Returns the inventory of a player as a data-matrix
*
* @method getInventory
*/
gameEngine.Player.prototype.getInventory = function() {
	var matrix = [];
	this.smallInventory.foreach(function(key,item) {
		matrix.push([item.type,item.amount]);
	});
	return matrix;
};

/**
* Returns the position of the user in block-coordinates
*
* @method getPosition
*/
gameEngine.Player.prototype.getPosition = function() {
	var x = this.sprite.x / config.blockSize;
	var y = this.sprite.y / config.blockSize;
	return [x,y];
};


/**
* Creates a new player-object and returns it
*
* @method PlayerFactory
* @param {Object} options Options for the player-object
* @return {Player} Returns a new player-object
*/
gameEngine.PlayerFactory = function(options){
	return new gameEngine.Player(options);
};

