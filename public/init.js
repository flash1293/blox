var socket = {};
if(config.multiplayer) {
	socket = io.connect('http://'+config.host);
}
/*socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});*/

//if the jaws-lib is loaded
jaws.onload = function() {

	//convert touch to mouse-events
	document.addEventListener("touchstart", touchHandler, true);
	document.addEventListener("touchmove", touchHandler, true);
	document.addEventListener("touchend", touchHandler, true);
	document.addEventListener("touchcancel", touchHandler, true);
	
	if(config.multiplayer) {
		socket.on('init', gameEngine.socketHandler.handleInit);
		socket.on('update', gameEngine.socketHandler.handleUpdate);
		socket.on('new', gameEngine.socketHandler.handleNew);
		socket.on('remove', gameEngine.socketHandler.handleRemove);
		socket.on('removeblock', gameEngine.socketHandler.handleBlockRemove);
		socket.on('changeblock', gameEngine.socketHandler.handleBlockChange);
		socket.on('chat', gameEngine.socketHandler.handleChat);
	}

	jaws.unpack(); //unpack it
	//add all assets from config.js
	config.assets.forEach(function(item) {
		jaws.assets.add(["assets/"+item]);
	});

	var canvWidth = config.viewPortWidth;
	var canvHeight = config.viewPortHeight;

	if(canvWidth == "dynamic") {
		canvWidth = window.innerWidth;
	}
	
	if(canvHeight == "dynamic") {
		canvHeight = window.innerHeight;
	}

	var startOptions = {/*bgcolor: 'skyblue',*/ width: canvWidth, height: canvHeight};

	//start the engine
	jaws.start(gameEngine,startOptions);

	window.onresize=function(){ 
		if(config.viewPortWidth == "dynamic") {
			jaws.canvas.width = window.innerWidth;
			jaws.width = window.innerWidth;
			gameEngine.viewport.width = window.innerWidth;
		}
		if(config.viewPortHeight == "dynamic") {
			jaws.canvas.height = window.innerHeight;
			jaws.height = window.innerHeight;
			gameEngine.viewport.height = window.innerHeight;
		}
		jaws.context = jaws.canvas.getContext("2d"); 
	};
	
	window.onbeforeunload = function() {
		if(config.persistPosition) {
			gameEngine.set("position",gameEngine.player.getPosition());
		}
		
		if(config.persistInventory) {
			gameEngine.set("smallInventory",gameEngine.player.getInventory());
		}
		
		gameEngine.persistCache();
	};



    }
