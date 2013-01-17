//object-extension for couting members
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};


//various configurations for the game-engine
var configuration = {
	mapWidth: 7000, //width of the complete map
	mapHeight: 1000, //height of the complete map
	viewPortWidth: 1000, //width of the canvas-els
	viewPortHeight: 500, //height of the canvas-els
	startPosX: 0, //start-position of the camera
	startPosY: 0, //end-position of the camera
	physicalFrame: 60, //frame-ticker
	frameSec: 1/this.physicalFrame,
	frameMSec: 1000/this.physicalFrame,
	blockSize: 50, //size of a block in px
	cameraSpeed: 5, //speed of the camera per frame
	blockPrerender: 3, //how much blocks are prerendered
	blockCleaner: 5, //in which range are blocks checked out
	blockCounterTime: 10, //all <blockCounterTime> Frames theres a checkinout-call
	host: 'http://localhost:1111/' //the host for images

};


//konstruktor of a default-block
//x = block-koordinate x (NOT pixel)
//y = block-koordinate y
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


//the main-object
var gameEngine = {

	//the world( manages blocks and agents)
	world: {
		getBlock: function(x,y) {
			return this.blocks[x][y];
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

	//the main agent (in some modes followed by camera
	actor: {}, //hier später ein spielerobjekt

	//the camera-object (saves position of the viewport etc.)
	camera: {
		x: configuration.startPosX,
		y: configuration.startPosY
	},

	//holds the current pressed keys
	keyMap: {},

	//updates the key-map (callback)
	updateKeyMap: function(e, val) {
		var keyCode = ('which' in e) ? e.which : e.keyCode;
		this.keyMap[keyCode]=val;
	},
	
	//processes user-input (so far key-strokes)
	applyControl: function(keymap) {
		if(keymap[87]) this.camera.y = this.camera.y + configuration.cameraSpeed;
		if(keymap[65]) this.camera.x = this.camera.x - configuration.cameraSpeed;
		if(keymap[83]) this.camera.y = this.camera.y - configuration.cameraSpeed;
		if(keymap[68]) this.camera.x = this.camera.x + configuration.cameraSpeed;
	},


	//initializes the game
	setup: function(cb) {
		window.onkeydown = function(e){gameEngine.updateKeyMap(e,true);};
		window.onkeyup = function(e){gameEngine.updateKeyMap(e,false);};
		this.viewLayer.init(cb);
		this.world.algs.normal(Math.floor(configuration.mapWidth/configuration.blockSize),Math.floor(configuration.mapHeight/configuration.blockSize),this.world);
		this.viewLayer.checkBlocksInOut(this.viewLayer.worldGroup,this.camera.x,this.camera.y);
	},


	//method called each frame
	physicalTick: function() {
		gameEngine.applyControl(gameEngine.keyMap);
		gameEngine.viewLayer.adjustToCamera(gameEngine.camera);
		if(gameEngine.viewLayer.isBlockTime()) {
			gameEngine.viewLayer.checkBlocksInOut(gameEngine.viewLayer.worldGroup,gameEngine.world.blocks,gameEngine.camera.x,gameEngine.camera.y);
		}
	},

	//manages all canvas-related things
	viewLayer : {

		//kineticjs-instance
		stage : new Kinetic.Stage({
			container: 'container',
			width: configuration.viewPortWidth,
			height: configuration.viewPortHeight
		}),


		//layer for an background-image
		backgroundLayer: new Kinetic.Layer(),

		//block-layer
		worldLayer : new Kinetic.Layer(),

		//group that contains all blocks
		worldGroup : new Kinetic.Group(),

		//layer for the agents
		agentLayer : new Kinetic.Layer(),

		//group that contains agents
		agentGroup : new Kinetic.Group(),


		//contains images for blocks (loaded to RAM per init-Method)
		blockImages: {

			//default dirt-block
			dirt: { url: configuration.host+'tile.jpg' },
		},

		//loads an Image and sets a callback when done
		loadImage: function(obj,cb) {
			obj.imageObject = new Image();
			obj.imageObject.src = obj.url;
			obj.imageObject.onload = cb;
		},

		//sets up a monitor for n calls and a callback if this n calls are performed
		getImageMonitor: function(len,finalCB) {
			var i=0;
			return function() {
				if((++i)>=len) {
					finalCB();
				}
			}
		},

		//counts to next checkInOutFrame
		blockCounter: 0,

		//determines whether this is an checkInOutFrame
		isBlockTime: function() {
			this.blockCounter++;
			if(this.blockCounter > configuration.blockCounterTime) {
				this.blockCounter = 0;
				return true;
			}
			return false;
		},


		//initializes the canvas-view
		init: function(cb) {

			//tie kinetic-stage together
			this.stage.add(this.backgroundLayer);
			this.stage.add(this.worldLayer);
			this.worldLayer.add(this.worldGroup);
			this.stage.add(this.agentLayer);
			this.agentLayer.add(this.agentGroup);


			//load all images from viewLayer.blockImages images async
			var monitor = this.getImageMonitor(Object.size(this.blockImages),cb);
			var key;
			for(key in this.blockImages) {
				this.loadImage(this.blockImages[key],monitor);
			}

		},

		//adjusts viewport to camera-coordinates and redraws the stage
		adjustToCamera: function(camera) {
			this.worldGroup.move(-(camera.x+this.worldGroup.getX()),-(camera.y+this.worldGroup.getY())); // -5, -5 -> -6, -6 = -1, -1  
			this.agentGroup.move(-(camera.x+this.agentGroup.getX()),-(camera.y+this.agentGroup.getY())); // -5, -5 -> -6, -6 = -1, -1  
			this.stage.draw();
		},


		//checks needed blocks in and unneeded blocks out of the viewGroup (performance)
		checkBlocksInOut: function(worldGroup,blocks,cameraX,cameraY) {
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
					if(blocks[i]!=undefined && blocks[i][j]!=undefined) {
						if(i>=xRangeFrom && i<xRangeTo && j>=yRangeFrom && j<yRangeTo )  {
							if(!blocks[i][j].checkedIn) {
								worldGroup.add(blocks[i][j].viewObject);
								blocks[i][j].checkedIn = true;
							}
						} else if(blocks[i][j].checkedIn) {
							blocks[i][j].viewObject.remove();
							blocks[i][j].checkedIn = false;
						}
					}
				}
			}
		},

	}
}

//set up the game and create interval-ticker when done
gameEngine.setup(function() {
	gameEngine.viewLayer.adjustToCamera(gameEngine.camera);
	setInterval(gameEngine.physicalTick,(1000/configuration.physicalFrame));
});
