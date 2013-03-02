
//various configs for the game-engine
var config = {
	mapWidth: 200, //width of the complete map
	mapHeight: 100, //height of the complete map
	viewPortWidth: "dynamic", //width of the canvas-els
	viewPortHeight: "dynamic", //height of the canvas-els
	startPosX: 20, //start-position of the camera
	startPosY: 50, //end-position of the camera
	blockSize: 50, //size of a block in px
	cameraSpeed: 5, //speed of the camera per frame
	gravity: 0.5, //velocity of gravity
	hitBoxOffset: 5,
	builder: { //config for the builder-algorithm
		name: 'normal', //name of the algorithm
		sinLength: 5.5, //alg-specific configs
		offset: 20,	//...
		amplitude: 8,
		stoneLevel: 5
	},
	//destinated time per frame
	physicalFrameTime: (1000/60), 
	multiplayer: true,
	//host: 'blox.eu01.aws.af.cm:80',
	host: '192.168.0.15:3000',
	updateInterval: 50,
	positionUpdateTolerance: 100,
	debug: true,
	//all asset-files being loaded before the game starts
	assets: [
		//game-object static parameters
		"players.json",
		"blocks.json",
		"tools.json",
		"items.json",

		//block-images
		"blocks/dirt.gif",
		"blocks/grass.gif",
		"blocks/stone.png",
		"blocks/void.png",

		//player-images
		"agents/minenarbeiter.png",

		//tool-images
		"tools/hand/simple.png"

	]
};
