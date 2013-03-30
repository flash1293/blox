
/**
 * Module dependencies.
 */

var express = require('express'), 
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    config = require('./public/config.json');

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

app.get('/', function(req, res){
	res.render('index',{single: config.enableSingleplayer, multi: config.enableMultiplayer, title: 'Blox'});
});

app.get('/singleplayer', function(req, res){
	config.multiplayer = false;
	res.render('single',{config: require('./blox/configloader')(config), title: 'Blox'});
});

app.get('/multiplayer', function(req, res){
	config.multiplayer = true;
	res.render('multi',{config: require('./blox/configloader')(config), title: 'Blox'});
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection',  require('./blox/communication').communicationHandler);
