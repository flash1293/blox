
/*
 * example options-object:
 * x: x-coordinate
 * y: y-coordinate
 * type: type/name of the player ( loaded from players.json)
 *
 * */
gameEngine.PlayerFactory = function(options){

	//create player-object
	var player = {};

	//initialize movement-vectors
	player.dx = 0;
	player.dy = 0;

	player.type = options.type;

	player.smallInventory = new Array(9);

	player.selectedItem = 0;
	
	player.bigInventory = new Array(36);

	//set controllmode of the player (keyboard, ki or remote)
	player.controllMode = options.controllMode;

	//load static info from players.json
	player.staticInfo = jaws.assets.get("assets/players.json")[options.type];

	player.health = player.staticInfo.health;

	//create a sprite-object for the player
	player.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom"	
	});

	//if the player has a default-tool, create it and link it to the player-object
	if(player.staticInfo.defaultTool != undefined) {
		player.tool = gameEngine.ToolFactory({type: player.staticInfo.defaultTool, carrier: options.type, x: options.x, y: options.y}, player);
	}

	//method to determine next move of the player (walk, stand, dig,...)
	player.controll = function() {
		//if controllmode keyboard, use the keyboard-behavior
		if(this.controllMode == "keyboard") {
			this.behavior.keyboard();
		}
		
		//if controllmode touch...
		if(this.controllMode == "touch") {
			this.behavior.touch();
		}

		//if controllmode ki, use the behavior of the current state ( statemachine)
		if(this.controllMode == "ki") {
			this.behavior[this.state]();
		}

		this.applyMovement();
		if(config.multiplayer && this.controllMode != "none") {
			this.update();
		}
	};

	player.update = function() {
		if(gameEngine.myId != undefined) {
			if(this.markDx != this.markDxOld || this.markDy != this.markDyOld) {
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
			}
		}
	};

	player.addItemsToInventory = function(type,amount) {
		for(var i=0;i<9;i++) {
			var item = this.smallInventory[i];
			if(item === undefined) {
				gameEngine.log("found empty slot, creating new item-stack");
				this.smallInventory[i] = gameEngine.ItemFactory({type: type, amount: amount});
				gameEngine.hud.updateItembox();
				return;
			}
			if(item.type == type && Number(item.staticInfo.maxAmount) >= (Number(item.amount) + Number(amount))) {
				gameEngine.log("found slot with same item-type, adding them up");
				this.smallInventory[i].amount = Number(this.smallInventory[i].amount) + Number(amount);
				gameEngine.hud.updateItembox();
				return;
			}
			if(item.type == type) {
				gameEngine.log("found slot with same item-type, but amount would be too high");
			}
		}	
		gameEngine.log("item got lost because inventory is full");
	}

	player.getCurrentItem = function() {
		return this.smallInventory[this.selectedItem];
	};

	player.decreaseCurrentItem = function(amount) {
		gameEngine.log("decreasing current item-stack by "+amount);
		var item = this.getCurrentItem();
		item.amount = Number(item.amount)-Number(amount);
		if(item.amount < 1) { 
			this.smallInventory[this.selectedItem] = undefined; 
			gameEngine.log("stack is empty, got removed");
		}
		gameEngine.hud.updateItembox();
	};

	player.applyMovement = function() {
		this.dx = this.markDx;
		if(this.markDy < 0 && this.can_jump) {
			this.dy = this.markDy;
			if(!this.isGravityDisabled()) this.can_jump = false;
		} else if(this.markDy > 0){
			this.dy = this.markDy;
		}
	};

	player.setHealth = function(value) {
		this.health = value;
		gameEngine.log("player-damage:"+value);
		if(this.hasHealthBar) {
			gameEngine.hud.setHealthTo(value/this.staticInfo.health);
		}
	};

	//create behavior-methods
	player.behavior = {};

	//user-controlled player
	player.behavior.keyboard = function() {
		if(jaws.pressed("a"))  { 
			player.markDx = -player.staticInfo.walkSpeed;
			//player.dx = -player.staticInfo.walkSpeed; 
		}
		else if(jaws.pressed("d")) { 
			player.markDx = player.staticInfo.walkSpeed;
			//player.dx = player.staticInfo.walkSpeed; 
		} else {
			player.markDx = 0;
			//player.dx = 0;
		}

		var gravityDisabled = player.isGravityDisabled();
		if(jaws.pressed("w")) { 
			player.markDy = (gravityDisabled ? -player.staticInfo.climbV : -player.staticInfo.jumpHeight);
			//player.dy = -player.staticInfo.jumpHeight; 
			//player.can_jump = false; 
		} else {
			if(gravityDisabled) player.markDy = player.staticInfo.climbDownV;
			else player.markDy = 0;
		}

		if(jaws.pressed("left_mouse_button") && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handleAction();
		}
		
		if(jaws.pressed("right_mouse_button") && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handlePlantAction();
		}


		if(jaws.pressed("t") && config.multiplayer && !gameEngine.chatBlocked) {
			jaws.releasePressedKey("t");
			gameEngine.chatBlocked = true;
			player.chat();
		} else {
			gameEngine.chatBlocked = false;
		}

		if(jaws.pressed("1")) {
			player.selectedItem = 0;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("2")) {
			player.selectedItem = 1;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("3")) {
			player.selectedItem = 2;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("4")) {
			player.selectedItem = 3;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("5")) {
			player.selectedItem = 4;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("6")) {
			player.selectedItem = 5;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("7")) {
			player.selectedItem = 6;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("8")) {
			player.selectedItem = 7;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("9")) {
			player.selectedItem = 8;
			gameEngine.hud.updateItembox();
		}

	};
	
	//user-controlled player (touch-device)
	player.behavior.touch = function() {
		var x = jaws.mouse_x+gameEngine.viewport.x-gameEngine.player.sprite.x;
		var y = jaws.mouse_y+gameEngine.viewport.y-gameEngine.player.sprite.y;

		if(jaws.pressed("left_mouse_button") && x < -gameEngine.player.sprite.width/2)  { 
			player.markDx = -player.staticInfo.walkSpeed; 
		} else if(jaws.pressed("left_mouse_button") && x > gameEngine.player.sprite.width/2) { 
			player.markDx = player.staticInfo.walkSpeed; 
		} else {
			player.markDx = 0;
		}
		
		var gravityDisabled = player.isGravityDisabled();
		if(jaws.pressed("left_mouse_button") && y < -gameEngine.player.sprite.height) { 
			player.markDy = (player.isGravityDisabled() ? -player.staticInfo.climbV : -player.staticInfo.jumpHeight); 
			//player.can_jump = false;
	        } else {
	        if(gravityDisabled) player.markDy = player.staticInfo.climbDownV;
			else player.markDy = 0;
		}

		if(jaws.pressed("left_mouse_button") && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handleAction();
		}

		if(jaws.pressed("left_mouse_button") && gameEngine.touchPlace && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handlePlantAction();
		}

	};

	player.chat = function(ev) {
		gameEngine.log("entering chat-message");
		var msg = prompt("Enter Message:","");
		if(msg) {
			socket.emit('chat', {player: '#'+gameEngine.myId, msg: msg });
		}
	};


	//draws the player and corresponding sprites (tools, blood, etc.)
	player.draw = function() {
		this.sprite.draw();
		if(this.tool != undefined && this.tool.staticInfo.visible) this.tool.draw();
	};
	
	player.isGravityDisabled = function() {
		var gravityDisabled = false;
		var collisionBlocks = gameEngine.world.atRect(this.sprite.rect().shrink(config.hitBoxOffset));
		for(var i=0;i<collisionBlocks.length;i++) { if(collisionBlocks[i].block.staticInfo.disableGravity) gravityDisabled = true; }
		return gravityDisabled;
	};

	//moves the player resp. to the movement-vectors and does collision-detection
	player.move = function() {
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

	//set back-reference from sprite to player-object
	player.sprite.player = player;


	//initialize the start-displaymode of the player
	player.displayMode = player.staticInfo.startDisplayMode;
	player.oldDisplayMode = player.staticInfo.startDisplayMode;

	//if the player is a human (2x1 block hitbox and is walking)
	if(player.staticInfo.typeClass == "human") {

		//create sprite and slice it to modes (stand, walk)
		var animation = new jaws.Animation({sprite_sheet: "assets/agents/"+player.staticInfo.sprite_sheet, frame_size: [50,100], frame_duration: 200});
		player.sprite.animations = {};
		player.sprite.animations.standright = animation.slice(0,1);
		player.sprite.animations.walkright = animation.slice(1,3);
		player.sprite.animations.standleft = animation.slice(3,4);
		player.sprite.animations.walkleft = animation.slice(4);

		//set the displaymode resp. to movement-vectors and probably adjusts the displaymode of the tool
		player.adjustDisplayMode = function() {
			this.oldDisplayMode = this.displayMode;
			if(this.dx > 0) this.displayMode = 'walkright';
			if(this.dx < 0) this.displayMode = 'walkleft';
			if(this.dx == 0) this.displayMode = ((this.oldDisplayMode == 'walkright' || this.oldDisplayMode == 'standright') ? 'standright' : 'standleft');
			this.sprite.setImage(this.sprite.animations[this.displayMode].next());

			if(this.tool != undefined) this.tool.adjustDisplayMode();
		};
	}

	player.lastUpdate = Date.now();


	//return player-object to caller of the factory-method
	return player;

};

