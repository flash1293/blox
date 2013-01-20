
/*
 * Beispiel für das options-Objekt:
 * x: x-Koordinate
 * y: y-Koordinate
 * type: Typ des Players (läd statische einstellungen aus players.json)
 *
 * */
gameEngine.PlayerFactory = function(options){
	var player = {};
	player.dx = 0;
	player.dy = 0;
	player.controllMode = options.controllMode;
	player.staticInfo = jaws.assets.get("assets/players.json")[options.type];
	player.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom"	
	});


	if(player.staticInfo.defaultTool != undefined) {
		player.tool = gameEngine.ToolFactory({type: player.staticInfo.defaultTool, carrier: options.type, x: options.x, y: options.y}, player);
	}

	player.controll = function() {
		if(this.controllMode == "keyboard") {
			this.behavior.keyboard();
		}
		if(this.controllMode == "ki") {
			this.behavior[this.state]();
		}
	};
	player.behavior = {};
	player.behavior.keyboard = function() {
		if(jaws.pressed("left"))  { player.dx = -player.staticInfo.walkSpeed; }
		else if(jaws.pressed("right")) { player.dx = player.staticInfo.walkSpeed; }
		else player.dx = 0;
		if(jaws.pressed("up"))    { if(player.can_jump) { player.dy = -player.staticInfo.jumpHeight; player.can_jump = false; } }
	};

	player.draw = function() {
		this.sprite.draw();
		if(this.tool != undefined && this.tool.staticInfo.visible) this.tool.draw();
	};
	player.move = function() {

		this.sprite.x += this.dx;


		if(this.staticInfo.collidable) {
			var collisionBlocks = gameEngine.world.atRect(this.sprite.rect());
			for(var i=0;i<collisionBlocks.length;i++) {
				if(collisionBlocks[i].block.staticInfo.collision) {
					this.sprite.x -= this.dx;
					break;
				}
			}
		}
			
		this.sprite.y += this.dy;

		if(this.staticInfo.collidable) {
			var collisionBlocks = gameEngine.world.atRect(this.sprite.rect());
			for(var i=0;i<collisionBlocks.length;i++) {
				if(collisionBlocks[i].block.staticInfo.collision) {
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

		if(this.staticInfo.gravitable) this.dy += config.gravity;

	};
	player.sprite.player = player;

	player.dx = 0;
	player.dy = 0;

	player.displayMode = player.staticInfo.startDisplayMode;
	player.oldDisplayMode = player.staticInfo.startDisplayMode;

	if(player.staticInfo.typeClass == "human") {
		var animation = new jaws.Animation({sprite_sheet: "assets/agents/"+player.staticInfo.sprite_sheet, frame_size: [50,100], frame_duration: 200});
		player.sprite.animations = {};
		player.sprite.animations.standright = animation.slice(0,1);
		player.sprite.animations.walkright = animation.slice(1,3);
		player.sprite.animations.standleft = animation.slice(3,4);
		player.sprite.animations.walkleft = animation.slice(4);

		player.adjustDisplayMode = function() {
			this.oldDisplayMode = this.displayMode;
			if(this.dx > 0) this.displayMode = 'walkright';
			if(this.dx < 0) this.displayMode = 'walkleft';
			if(this.dx == 0) this.displayMode = ((this.oldDisplayMode == 'walkright' || this.oldDisplayMode == 'standright') ? 'standright' : 'standleft');
			this.sprite.setImage(this.sprite.animations[this.displayMode].next());

			if(this.tool != undefined) this.tool.adjustDisplayMode();
		};
	}


	return player;

};

