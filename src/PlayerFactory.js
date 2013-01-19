
/*
 * Beispiel für das options-Objekt:
 * x: x-Koordinate
 * y: y-Koordinate
 * type: Typ des Players (läd statische einstellungen aus players.json)
 *
 * */
gameEngine.PlayerFactory = function(options){
	player = {};
	player.x = options.x;
	player.y = options.y;
	player.dx = 0;
	player.dy = 0;
	player.staticInfo = jaws.assets.get("assets/players.json")[options.type];
	player.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom"	
	});
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
		};
	}


	return player;

};

