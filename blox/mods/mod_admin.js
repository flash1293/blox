var socketEmitter = {};
var gameEngine = {};

module.exports = {
	addPlayer: function(data) {
		var id = data.id;
		var player = data.player;
	},
	removePlayer: function(data) {
 		var id = data.id;
	},
	updatePlayer: function(data) {
		var id = data.id;
		var data = data.data;
	},
	updateBlock: function(data) {
		var data = data.data;
	},
	tick: function(data) {
		
	},
	chat: function(data) {
		var id = data.id;
		var msg = data.msg;
		console.log(data);
		console.log(msg);
		console.log(id);
		if(msg == "spawn") {
			console.log("spawn new bot..");
			gameEngine.createBot({type: 'minenarbeiter', x: 500, y: 100, controllMode: 'harmless'});
		}
	},
	setEmitter: function(emitter) {
		socketEmitter = emitter;
	},
	setGameEngine: function(ge) {
		gameEngine = ge;
	}
};