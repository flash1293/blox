
//various configs for the game-engine
var config = {
	mapWidth: 1000, //width of the complete map
	mapHeight: 100, //height of the complete map
	viewPortWidth: window.innerWidth, //width of the canvas-els
	viewPortHeight: window.innerHeight, //height of the canvas-els
	startPosX: 20, //start-position of the camera
	startPosY: 50, //end-position of the camera
	blockSize: 50, //size of a block in px
	cameraSpeed: 5, //speed of the camera per frame
	gravity: 1,
	builder: {
		name: 'normal',
		sinLength: 5.5,
		offset: 20,
		amplitude: 8,
		stoneLevel: 5
	},
	physicalFrameTime: 1000/60,
	assets: [
		"players.json",
		"blocks.json",

		"blocks/dirt.gif",
		"blocks/grass.gif",
		"blocks/stone.png",
		"agents/minenarbeiter.png"
	]
};
