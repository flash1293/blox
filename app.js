
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');

var app = express();

var server = http.createServer(app)
var io = require('socket.io').listen(server);


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var players = [];

players.push({id:0, active: false});

io.sockets.on('connection', function (socket) {
	console.log('new connection');
	socket.on('register', function(data) {
		console.log("registered");

		var player = { id: players.length, data: data, socket: socket, active: true };
		socket.emit('init', {id: players.length});

		for(var i=0;i<players.length;i++) { 
			if(players[i].active) {
				console.log('inform new player about #'+i); 
				socket.emit('new', { id: players[i].id, data: players[i].data }); 
			}
		}

		for(var i=0;i<players.length;i++) { 
			if(players[i].active) {
				console.log('inform '+i+' about new player');
				players[i].socket.emit('new', {id: player.id, data: player.data  } ); 
			}
		}

		players.push(player);

		socket.on('update', function (data) {
			player.data.x = data.x;
			player.data.y = data.y;
			console.log(Date.now()+':');
			console.log(data);
			for(var i=0;i<players.length;i++) { 
				if(players[i].active && players[i].socket !== socket) {
					players[i].socket.emit('update', data);
				}
			}
		});

		socket.on('disconnect', function() {
			player.active = false;
			console.log('set player '+player.id+' to not active');
			for(var i=0;i<players.length;i++) { 
				if(players[i].active && players[i].socket !== socket) {
					players[i].socket.emit('remove', {id: player.id});
				}
			}
		});
	});
});

