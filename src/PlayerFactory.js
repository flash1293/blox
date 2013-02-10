
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

	//set controllmode of the player (keyboard, ki or remote)
	player.controllMode = options.controllMode;

	//load static info from players.json
	player.staticInfo = jaws.assets.get("assets/players.json")[options.type];

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
	};

	//create behavior-methods
	player.behavior = {};

	//user-controlled player
	player.behavior.keyboard = function() {
		if(jaws.pressed("left"))  { player.dx = -player.staticInfo.walkSpeed; }
		else if(jaws.pressed("right")) { player.dx = player.staticInfo.walkSpeed; }
		else player.dx = 0;
		if(jaws.pressed("up"))    { if(player.can_jump) { player.dy = -player.staticInfo.jumpHeight; player.can_jump = false; } }
		if(jaws.pressed("left_mouse_button") && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handleAction();
		}
	};
	
	//user-controlled player (touch-device)
	player.behavior.touch = function() {
		var x = jaws.mouse_x+gameEngine.viewport.x-gameEngine.player.sprite.x;
		var y = jaws.mouse_y+gameEngine.viewport.y-gameEngine.player.sprite.y;
		if(x < -gameEngine.player.sprite.width/2)  { player.dx = -player.staticInfo.walkSpeed; }
		else if(x > gameEngine.player.sprite.width/2) { player.dx = player.staticInfo.walkSpeed; }
		else player.dx = 0;
		if(y < -gameEngine.player.sprite.height)    { if(player.can_jump) { player.dy = -player.staticInfo.jumpHeight; player.can_jump = false; } }
		if(jaws.pressed("left_mouse_button") && player.tool != undefined) { 
			player.tool.active =  true; 
			player.tool.handleAction();
		}
	};


	//draws the player and corresponding sprites (tools, blood, etc.)
	player.draw = function() {
		this.sprite.draw();
		if(this.tool != undefined && this.tool.staticInfo.visible) this.tool.draw();
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
					} else if(this.dy < 0) {
						this.sprite.y = collisionBlocks[i].rect().bottom + this.sprite.height;
					}
					this.dy = 0;
					break;
				}
			}
		}

		//if the player is influenced by gravity, calculate gravity in the y-movement-vector
		if(this.staticInfo.gravitable) this.dy += config.gravity;

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


	//return player-object to caller of the factory-method
	return player;

};

