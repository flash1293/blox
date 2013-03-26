module.exports = {
	remote: function() {},
	harmless: function() {
		var now = Date.now();
		if(now-3000 > this.lastMove) {
			console.log(this.sprite.x+','+this.sprite.y);
			dir = Math.floor(Math.random()+0.5);
			this.markDx = (dir == 0 ? -this.staticInfo.walkSpeed : this.staticInfo.walkSpeed);
			jump = Math.floor(Math.random()+0.5);
			this.markDy = (jump == 0 ? -this.staticInfo.jumpHeight : 0);
			this.lastMove = now;
		}
	}
};
