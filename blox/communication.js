
/* array für alle player */
var players = [];

/* liste aller änderungen an der map */
var mapChanges = [];

/* füge einen deaktivierten default-user ein */
players.push({id:0, active: false});

/* handle eine update-nachricht */
updateHandler = function(player, socket, data) {
	player.data.x = data.x;
	player.data.y = data.y;
	console.log(Date.now()+':');
	console.log(data);
	forAllOtherPlayers(socket, function(otherPlayer) {
		otherPlayer.socket.emit('update', data);
	});
};

/* handle einen verbindungsabbruch */
disconnectHandler = function(player, socket, data) {
	player.active = false;
	console.log('set player '+player.id+' to not active');
	forAllOtherPlayers(socket, function(otherPlayer) {
		otherPlayer.socket.emit('remove', {id: player.id});
	});
};

/* handle eine block-entfernung */
removeBlockHandler = function(player, socket, data) {
	console.log('player +'+player.id+' removes block '+data.x+','+data.y);
	mapChanges.push({type:'removeblock', data: data});
	forAllOtherPlayers(socket, function(otherPlayer) {
		otherPlayer.socket.emit('removeblock', data);
	});
};

/* handle eine block-änderung */
changeBlockHandler = function(player, socket, data) {
	console.log('player +'+player.id+' changes block '+data.x+','+data.y);
	mapChanges.push({type:'changeblock', data: data});
	forAllOtherPlayers(socket, function(otherPlayer) {
	otherPlayer.socket.emit('changeblock', data);
	});
};

/* führe ein callback für alle player aus (ausser einem) */
forAllOtherPlayers = function(mySocket, callback) {
	for(var i=0;i<players.length;i++) { 
		if(players[i].active && players[i].socket !== mySocket) {
			callback(players[i],i);
		}
	}
};


/* führe ein callback für alle player aus */
forAllPlayers = function(callback) {
	for(var i=0;i<players.length;i++) { 
		if(players[i].active) {
			callback(players[i],i);
		}
	}
};

/* verarbeite ankommende verbindungen */
module.exports.communicationHandler = function(socket) {
	console.log('new connection');

	/* verarbeite den registrier-prozess einer verbindung */
	socket.on('register', function(data) {
		console.log("registered");

		/* erzeuge neuen player und teile teilnehmer seine id mit */
		var player = { id: players.length, data: data, socket: socket, active: true };
		socket.emit('init', {id: players.length});

		/* informiere den neuen player über die bisherigen im spiel */
		forAllPlayers(function(otherPlayer, index) {	
			console.log('inform new player about #'+index); 
			player.socket.emit('new', { id: otherPlayer.id, data: otherPlayer.data }); 
		});

		/* informiere den neuen player über änderungen an der map */
		for(var i=0;i<mapChanges.length;i++) {
			var change = mapChanges[i];
			player.socket.emit(change.type, change.data);
		}


		/* informiere alle, die schon im spiel sind, über den neuen spieler */
		forAllPlayers(function(otherPlayer, index) {
			console.log('inform '+index+' about new player');
			otherPlayer.socket.emit('new', {id: player.id, data: player.data  } ); 
		});


		/* verknüpfe update und disconnect-abarbeitung */
		socket.on('update',function(data) {updateHandler(player, socket, data)});
		socket.on('disconnect',function(data) {disconnectHandler(player, socket, data)});
		socket.on('removeblock',function(data) {removeBlockHandler(player, socket, data)});
		socket.on('changeblock',function(data) {changeBlockHandler(player, socket, data)});

		/* füge neuen player hinzu */
		players.push(player);
	});
};