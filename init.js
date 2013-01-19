
jaws.onload = function() {
	jaws.unpack();
	config.assets.forEach(function(item) {
		jaws.assets.add(["assets/"+item]);
	});
	jaws.start(gameEngine,{bgcolor: 'skyblue', width: config.viewPortWidth, height: config.viewPortHeight});
    }
