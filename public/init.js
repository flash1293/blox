
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

	jaws.unpack(); //unpack it
	//add all assets from config.js
	config.assets.forEach(function(item) {
		jaws.assets.add(["assets/"+item]);
	});

	//start the engine
	jaws.start(gameEngine,{bgcolor: 'skyblue', width: config.viewPortWidth, height: config.viewPortHeight});


    }
