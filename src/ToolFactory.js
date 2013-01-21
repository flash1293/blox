

/*
 * example options-object:
 * type: type/name of the tool (loads static parameters from tools.json)
 *
 * */
gameEngine.ToolFactory = function(options, carrier){

	//initialize tool-object
	var tool={};

	//back-reference to tool-holding player
	tool.carrier = carrier;

	//the name of the tool (id in tools.json)
	tool.name = options.type;

	//all static parameters about this tool (got from tools.json)
	tool.staticInfo = jaws.assets.get("assets/tools.json")[options.type];
	

	//temp. var for the sprite-options for this tool for this carrier
	var spriteOptions = tool.staticInfo.sprite[options.carrier];
	
	//create sprite-object
	tool.sprite = new jaws.Sprite({
			x: options.x,
			y: options.y,
			anchor_x: spriteOptions.anchor_x,
			anchor_y: spriteOptions.anchor_y
	});


	//cache offset-values (resp. to the player) and anchor-points(for rotation of the tool)
	tool.sprite.yFixOffset = (1-spriteOptions.anchor_y)*spriteOptions.frameSize[1];
	tool.sprite.xFixOffsetRight = (spriteOptions.anchor_x/2)*spriteOptions.frameSize[0];
	tool.sprite.xFixOffsetLeft = -(spriteOptions.anchor_x/2)*spriteOptions.frameSize[0];
	tool.sprite.xAnchorRight = spriteOptions.anchor_x;
	tool.sprite.xAnchorLeft = (1-spriteOptions.anchor_x);


	//load sprite and splice it to hold and active-modes
	var animation = new jaws.Animation({sprite_sheet: "assets/tools/"+options.type+"/"+spriteOptions.sprite_sheet, frame_size: spriteOptions.frameSize, frame_duration: spriteOptions.duration});
	tool.sprite.animations = {};
	tool.sprite.animations.holdright = animation.slice(0,1);
	tool.sprite.animations.activeright = animation.slice(0,spriteOptions.frameCount);
	tool.sprite.animations.holdleft = animation.slice(spriteOptions.frameCount,spriteOptions.frameCount+1);
	tool.sprite.animations.activeleft = animation.slice(spriteOptions.frameCount);
	tool.sprite.animations.activeright.loop = false;
	tool.sprite.animations.activeleft.loop = false;

	//if the active-animation is done, set active to false and reset the index-value
	//if the player is still active, it will be resetted by the player-command-function
	tool.sprite.animations.activeright.on_end = function() {
		tool.active = false;
	       	this.index = 0;
	}
	tool.sprite.animations.activeleft.on_end = function() { 
		tool.active = false;
	       	this.index = 0;
	}

	//method to determine the right animation to display
	tool.adjustDisplayMode = function() {
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

	}

	//draw the tool resp. to the player holding it
	tool.draw = function() {
		this.sprite.x = this.carrier.sprite.x-((this.displayMode == "activeleft" || this.displayMode == "holdleft")?this.sprite.xFixOffsetLeft : this.sprite.xFixOffsetRight);
		this.sprite.y = this.carrier.sprite.y-this.sprite.yFixOffset;
		this.sprite.draw();
	}

	//return tool-object to embed it in the player-object
	return tool;

};
