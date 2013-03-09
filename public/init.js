
var socket = io.connect('http://'+config.host);
/*socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});*/

//if the jaws-lib is loaded
jaws.onload = function() {
	
	socket.on('init', gameEngine.handleInit);
	socket.on('update', gameEngine.handleUpdate);
	socket.on('new', gameEngine.handleNew);
	socket.on('remove', gameEngine.handleRemove);
	socket.on('removeblock', gameEngine.handleBlockRemove);
	socket.on('changeblock', gameEngine.handleBlockChange);
	socket.on('chat', gameEngine.handleChat);

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

	var startOptions = {bgcolor: 'skyblue', width: canvWidth, height: canvHeight};
	console.log(startOptions);

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



    }
