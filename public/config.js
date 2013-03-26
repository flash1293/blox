
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
		stoneLevel: 5,
		treeStartPos: 5,
		treeMaxDif: 7,
		treeMinDif: 2,
		voidSeed: "jojo",
	 	voidCaveAmount: 100,
	 	voidCaveMinLength: 5,
	 	voidCaveMaxLength: 20,
	 	voidCaveMaxHeight: 4,
	 	coalSeed: "jojo1",
	 	coalCaveAmount: 200,
	 	coalCaveMinLength: 2,
	 	coalCaveMaxLength: 10,
	 	coalCaveMaxHeight: 3,
	 	goldSeed: "jojo2",
	 	goldCaveAmount: 50,
	 	goldCaveMinLength: 1,
	 	goldCaveMaxLength: 8,
	 	goldCaveMaxHeight: 2,
	 	silverSeed: "jojo3",
	 	silverCaveAmount: 100,
	 	silverCaveMinLength: 3,
	 	silverCaveMaxLength: 8,
	 	silverCaveMaxHeight: 2
	},
	//destinated time per frame
	physicalFrameTime: (1000/60), 
	multiplayer: true,
	//host: 'blox.eu01.aws.af.cm:80',
	host: '127.0.0.1:3000',
	updateInterval: 50,
	positionUpdateTolerance: 100,
	chatDelay: 10000,
	touchTolerance: 30,
	debug: true,
	//all asset-files being loaded before the game starts
	assets: [
		//game-object static parameters
		"players.json",
		"blocks.json",
		"tools.json",
		"items.json",

		//block-images
		"blocks/dirt.png",
		"blocks/grass.png",
		"blocks/stone.png",
		"blocks/void.png",
		"blocks/coal.png",
		"blocks/gold.png",
		"blocks/ladder.png",
		"blocks/leaves.png",
		"blocks/silver.png",
		"blocks/sulfur.png",
		"blocks/titan.png",
		"blocks/uran.png",
		"blocks/wood.png",

		//player-images
		"agents/minenarbeiter.png",

		//tool-images
		"tools/hand/simple.png"

	]
};

if(typeof module !== "undefined" && ('exports' in module)) { module.exports = config }