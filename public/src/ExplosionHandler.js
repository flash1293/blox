gameEngine = gameEngine || {};

gameEngine.ExplosionHandler = function(world) { 
    this.currentExplosions = [];
    this.world = world;
};

gameEngine.ExplosionHandler.prototype.scheduleNewExplosion = function(x,y) {
    var explosion = new gameEngine.Explosion(x,y);
    this.currentExplosions.push(explosion);
    
    this.world.push(explosion.sprite);
};

gameEngine.ExplosionHandler.prototype.bigExplosion = function() {
    for(var i=5;i<10;i++) {
        for(var j=20;j<30;j++) {
            this.scheduleNewExplosion(i,j);
        }
    }
};

gameEngine.ExplosionHandler.prototype.adjust = function() {
    for(var i=0;i<this.currentExplosions.length;i++) {
        var currentExplosion = this.currentExplosions[i];
        if(!currentExplosion.next()) {
            //remove current explosion
            var objs = this.world.cell(currentExplosion.x,currentExplosion.y);
            //search for explosion-sprite
            for(var j=0;j<objs.length;j++) {
                //remove it
                if(objs[j].explosion == currentExplosion) {
                    objs.splice(j, 1);
                }
            }
            this.currentExplosions.splice(i,1);
            i = i-1; //adjust index in current iteration
        } else {
            ;
        }
    }
};

gameEngine.Explosion = function(x,y) {
    this.animation = new jaws.Animation({sprite_sheet: "assets/blocks/explosion.png", frame_size: [50,50], frame_duration: 100, loop:false});
    this.sprite = new jaws.Sprite({
		scale: 1,
		anchor: 'top_left',
		x: x*config.blockSize,
		y: y*config.blockSize,
        width: config.blockSize,
        height: config.blockSize,
	});	
    this.sprite.explosion = this;
    this.sprite.setImage(this.animation.next());
    this.x = x;
    this.y = y;
};

/**
* Sets the explosion-sprite to the next frame
* @method next
* @returns {Boolean} false if it was the last frame, true if there are more
*/
gameEngine.Explosion.prototype.next = function() {
    this.sprite.setImage(this.animation.next());
    return this.animation.index < (this.animation.frames.length-1);
};