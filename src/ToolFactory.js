

/*
 * Beispiel für das options-Objekt:
 * type: Typ des Tools (läd statische einstellungen aus players.json)
 *
 * */
gameEngine.ToolFactory = function(options, carrier){
	var tool={};
	tool.carrier = carrier;
	tool.name = options.type;
	tool.staticInfo = jaws.assets.get("assets/tools.json")[options.type];
	
	tool.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor: "center_bottom"	
	});

	var spriteOptions = tool.staticInfo.sprite[options.carrier];

	var animation = new jaws.Animation({sprite_sheet: "assets/tools/"+options.type+"/"+spriteOptions.sprite_sheet, frame_size: spriteOptions.frameSize, frame_duration: spriteOptions.duration});
	tool.sprite.animations = {};
	tool.sprite.animations.holdright = animation.slice(0,1);
	tool.sprite.animations.activeright = animation.slice(0,spriteOptions.frameCount);
	tool.sprite.animations.holdleft = animation.slice(spriteOptions.frameCount,spriteOptions.frameCount+1);
	tool.sprite.animations.activeleft = animation.slice(spriteOptions.frameCount);

	tool.adjustDisplayMode = function() {
		if(this.carrier.displayMode == "standright" || this.carrier.displayMode == "walkright") this.displayMode = "holdright";
		if(this.carrier.displayMode == "standleft" || this.carrier.displayMode == "walkleft") this.displayMode = "holdleft";
		this.sprite.setImage(this.sprite.animations[this.displayMode].next());

	}

	tool.draw = function() {
		this.sprite.x = this.carrier.sprite.x;
		this.sprite.y = this.carrier.sprite.y;
		this.sprite.draw();
	}

	return tool;

};
