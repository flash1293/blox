
/**
* Controllers for different input-types (keyboard/touch etc.)
*
* @module Blox
* @submodule Controlling
* @class Controller
*/
gameEngine.controllers = {
	/**
	* Handles keyboard-input (wasd, left/right mouse)
	* @method keyboard
	*/
	keyboard: function() {
		//handle walking right/left
		if(jaws.pressed("a"))  { 
			this.markDx = -this.staticInfo.walkSpeed;
			//this.dx = -this.staticInfo.walkSpeed; 
		}
		else if(jaws.pressed("d")) { 
			this.markDx = this.staticInfo.walkSpeed;
			//this.dx = this.staticInfo.walkSpeed; 
		} else {
			this.markDx = 0;
			//this.dx = 0;
		}
	
	
		//handle jumping
		var gravityDisabled = this.isGravityDisabled();
		if(jaws.pressed("w")) { 
			this.markDy = (gravityDisabled ? -this.staticInfo.climbV : -this.staticInfo.jumpHeight);
			//this.dy = -this.staticInfo.jumpHeight; 
			//this.can_jump = false; 
		} else {
			if(gravityDisabled) this.markDy = this.staticInfo.climbDownV;
			else this.markDy = 0;
		}
	
		//handle digging/attacking
		if(jaws.pressed("left_mouse_button") && this.tool != undefined) { 
			this.tool.active =  true; 
			this.tool.handleAction();
		}
		
		//handle block-planting
		if(jaws.pressed("right_mouse_button") && this.tool != undefined) { 
			this.tool.active =  true; 
			this.tool.handlePlantAction();
		}
	
	
		//handle chat
		if(jaws.pressed("t") && config.multithis && !gameEngine.chatBlocked) {
			jaws.releasePressedKey("t");
			gameEngine.chatBlocked = true;
			this.chat();
		} else {
			gameEngine.chatBlocked = false;
		}
	
		//selecting items in the inventory
		if(jaws.pressed("1")) {
			this.selectedItem = 0;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("2")) {
			this.selectedItem = 1;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("3")) {
			this.selectedItem = 2;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("4")) {
			this.selectedItem = 3;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("5")) {
			this.selectedItem = 4;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("6")) {
			this.selectedItem = 5;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("7")) {
			this.selectedItem = 6;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("8")) {
			this.selectedItem = 7;
			gameEngine.hud.updateItembox();
		}
		if(jaws.pressed("9")) {
			this.selectedItem = 8;
			gameEngine.hud.updateItembox();
		}
	},
	/**
	* Handles touch-input (smarthpone/tablet)
	* @method touch
	*/
	touch:function() {
		var x = jaws.mouse_x+gameEngine.viewport.x-gameEngine.this.sprite.x;
		var y = jaws.mouse_y+gameEngine.viewport.y-gameEngine.this.sprite.y;

		if(jaws.pressed("left_mouse_button") && x < -gameEngine.this.sprite.width/2)  { 
			this.markDx = -this.staticInfo.walkSpeed; 
		} else if(jaws.pressed("left_mouse_button") && x > gameEngine.this.sprite.width/2) { 
			this.markDx = this.staticInfo.walkSpeed; 
		} else {
			this.markDx = 0;
		}
		
		var gravityDisabled = this.isGravityDisabled();
		if(jaws.pressed("left_mouse_button") && y < -gameEngine.this.sprite.height) { 
			this.markDy = (this.isGravityDisabled() ? -this.staticInfo.climbV : -this.staticInfo.jumpHeight); 
			//this.can_jump = false;
	        } else {
	        if(gravityDisabled) this.markDy = this.staticInfo.climbDownV;
			else this.markDy = 0;
		}

		if(jaws.pressed("left_mouse_button") && this.tool != undefined) { 
			this.tool.active =  true; 
			this.tool.handleAction();
		}

		if(jaws.pressed("left_mouse_button") && gameEngine.touchPlace && this.tool != undefined) { 
			this.tool.active =  true; 
			this.tool.handlePlantAction();
		}

	}
}