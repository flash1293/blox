//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


var configuration = {
	mapWidth: 7000,
	mapHeight: 1000,
	viewPortWidth: 1000,
	viewPortHeight: 500,
	startPosX: 0,
	startPosY: 0,
	physicalFrame: 50,
	frameSec: 1/this.physicalFrame,
	frameMSec: 1000/this.physicalFrame,
	blockSize: 50,
	cameraSpeed: 5,
	blockPrerender: 3,
	blockCleaner: 5,
	blockCounterTime: 10,
	host: 'http://localhost:1111/'

};

function NormalBlock(x,y) {
	this.x = x;
	this.y = y;
	this.viewObject = new Kinetic.Image({
		x: x*configuration.blockSize,
		y: y*configuration.blockSize,
		width: configuration.blockSize,
		height: configuration.blockSize,
		image: gameEngine.viewLayer.blockImages.dirt.imageObject
	});

}

var gameEngine = {
	world: {
		getBlock: function(x,y) {
			return this.blocks[x][y];
		},
		checkCounter: 0,
		checkBlocksInOut: function(worldGroup,cameraX,cameraY) {
			var xRangeFrom,xRangeTo,yRangeFrom,yRangeTo;
			xRangeFrom = Math.floor(cameraX / configuration.blockSize - configuration.blockPrerender);
			xRangeTo = Math.floor((cameraX+configuration.viewPortWidth) / configuration.blockSize + configuration.blockPrerender);
			yRangeFrom = Math.floor(cameraY / configuration.blockSize - configuration.blockPrerender);
			yRangeTo = Math.floor((cameraY + configuration.viewPortHeight) / configuration.blockSize + configuration.blockPrerender);

			xRangeFrom = xRangeFrom < 0 ? 0 : xRangeFrom;
			xRangeTo = xRangeTo >= configuration.mapWidth/configuration.blockSize ? configuration.mapWidth/configuration.blockSize : xRangeTo;
			yRangeFrom = yRangeFrom < 0 ? 0 : yRangeFrom;
			yRangeTo = yRangeTo >= configuration.mapHeight/configuration.blockSize ? configuration.mapHeight/configuration.blockSize : yRangeTo;
			for(var i=xRangeFrom-configuration.blockCleaner;i<xRangeTo+configuration.blockCleaner;i++) {
				for(var j=yRangeFrom-configuration.blockCleaner;j<yRangeTo+configuration.blockCleaner;j++) {
					if(this.blocks[i]!=undefined && this.blocks[i][j]!=undefined) {
						if(i>=xRangeFrom && i<xRangeTo && j>=yRangeFrom && j<yRangeTo )  {
							if(!this.blocks[i][j].checkedIn) {
								worldGroup.add(this.blocks[i][j].viewObject);
								this.blocks[i][j].checkedIn = true;
								//console.log("checked in: "+ (++this.checkCounter));
							}
						} else if(this.blocks[i][j].checkedIn) {
							this.blocks[i][j].viewObject.remove();
							this.blocks[i][j].checkedIn = false;
							//console.log("checked out: "+ (--this.checkCounter));
						}
					}
				}
			}
		},
		algs: {
			normal: function(xrange,yrange,world) {
				var y = Math.floor(yrange/2);
				world.blocks = new Array(xrange);
				for(var i=0;i<xrange;i++) {
					world.blocks[i]=new Array(yrange);
					for(var j=y;j<yrange;j++) {
						world.blocks[i][j]=new NormalBlock(i,j);
					}
				}
				world.blocks[5][5]=new NormalBlock(5,5);
			}		
		}
	},
	actor: {}, //hier später ein spielerobjekt
	camera: {
		x: configuration.startPosX,
		y: configuration.startPosY
	},
	keyMap: {},
	updateKeyMap: function(e, val) {
		var keyCode = ('which' in e) ? e.which : e.keyCode;
		this.keyMap[keyCode]=val;
	},
	setup: function(cb) {
		window.onkeydown = function(e){gameEngine.updateKeyMap(e,true);};
		window.onkeyup = function(e){gameEngine.updateKeyMap(e,false);};
		this.viewLayer.init(cb);
		this.world.algs.normal(Math.floor(configuration.mapWidth/configuration.blockSize),Math.floor(configuration.mapHeight/configuration.blockSize),this.world);
		this.world.checkBlocksInOut(this.viewLayer.worldGroup,this.camera.x,this.camera.y);
	},
	applyControl: function(keymap) {
		if(keymap[87]) this.camera.y = this.camera.y + configuration.cameraSpeed;
		if(keymap[65]) this.camera.x = this.camera.x - configuration.cameraSpeed;
		if(keymap[83]) this.camera.y = this.camera.y - configuration.cameraSpeed;
		if(keymap[68]) this.camera.x = this.camera.x + configuration.cameraSpeed;
	},
	physicalTick: function() {
		gameEngine.applyControl(gameEngine.keyMap);
		gameEngine.viewLayer.adjustToCamera(gameEngine.camera);
		if(gameEngine.viewLayer.isBlockTime()) {
			gameEngine.world.checkBlocksInOut(gameEngine.viewLayer.worldGroup,gameEngine.camera.x,gameEngine.camera.y);
		}
	},
	viewLayer : {
		stage : new Kinetic.Stage({
			container: 'container',
			width: configuration.viewPortWidth,
			height: configuration.viewPortHeight
		}),

		backgroundLayer: new Kinetic.Layer(),
		worldLayer : new Kinetic.Layer(),
		worldGroup : new Kinetic.Group(),
		agentLayer : new Kinetic.Layer(),
		agentGroup : new Kinetic.Group(),

		blockImages: {
			dirt: { url: configuration.host+'tile.jpg' },
		},
		loadImage: function(obj,cb) {
			obj.imageObject = new Image();
			obj.imageObject.src = obj.url;
			obj.imageObject.onload = cb;
		},
		getImageMonitor: function(len,finalCB) {
			var i=0;
			return function() {
				if((++i)>=len) {
					finalCB();
				}
			}
		},

		blockCounter: 0,
		isBlockTime: function() {
			this.blockCounter++;
			if(this.blockCounter > configuration.blockCounterTime) {
				this.blockCounter = 0;
				return true;
			}
			return false;
		},
		init: function(cb) {

			//tie kinetic-stage
			this.stage.add(this.backgroundLayer);
			this.stage.add(this.worldLayer);
			this.worldLayer.add(this.worldGroup);
			this.stage.add(this.agentLayer);
			this.agentLayer.add(this.agentGroup);


			//load images async
			var monitor = this.getImageMonitor(Object.size(this.blockImages),cb);
			var key;
			for(key in this.blockImages) {
				this.loadImage(this.blockImages[key],monitor);
			}

		},

		adjustToCamera: function(camera) {
			this.worldGroup.move(-(camera.x+this.worldGroup.getX()),-(camera.y+this.worldGroup.getY())); // -5, -5 -> -6, -6 = -1, -1  
			this.agentGroup.move(-(camera.x+this.agentGroup.getX()),-(camera.y+this.agentGroup.getY())); // -5, -5 -> -6, -6 = -1, -1  
			this.stage.draw();
		}

	}
}
gameEngine.setup(function() {
	gameEngine.viewLayer.adjustToCamera(gameEngine.camera);
	setInterval(gameEngine.physicalTick,(1000/configuration.physicalFrame));
});
