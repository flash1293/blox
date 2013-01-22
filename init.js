
//if the jaws-lib is loaded
jaws.onload = function() {

	jaws.unpack(); //unpack it
	//add all assets from config.js
	config.assets.forEach(function(item) {
		jaws.assets.add(["assets/"+item]);
	});

	//start the engine
	jaws.start(gameEngine,{bgcolor: 'skyblue', width: config.viewPortWidth, height: config.viewPortHeight});
    }
