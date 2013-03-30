
/**
 * Module dependencies.
 */

var express = require('express'), 
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    config = require('./public/config.json'),
    store  = require("./blox/store");

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
	store.getList('singleMaps:list',function(maps) {
		res.render('index',{single: config.enableSingleplayer, multi: config.enableMultiplayer, maps: maps, title: 'Blox'});
	});
});

app.get('/singleplayer', function(req, res){
	config.multiplayer = false;
	res.render('game',{config: require('./blox/configloader')(config), delta: null, multi: false, title: 'Blox'});
});

app.get('/visit', function(req, res){
	store.get("singleMaps:delta:"+req.query.name,function(map) {
		config.multiplayer = false;
		config.allowDigging = false;
		config.allowPlanting = false;
		res.render('game',{config: require('./blox/configloader')(config), multi: false, delta: require('./blox/deltaloader')(map),title: 'Blox'});
	});
});

app.get('/multiplayer', function(req, res){
	config.multiplayer = true;
	res.render('game',{config: require('./blox/configloader')(config), delta: null, multi: true, title: 'Blox'});
});

app.post('/store', function(req, res){
	var mapDelta = req.body.delta;
	var mapName = req.body.name;
	console.log("storing "+mapName+"-delta");
	store.set("singleMaps:delta:"+mapName,mapDelta);
	store.lpush("singleMaps:list",mapName);
	res.json({'ok': true});
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection',  require('./blox/communication').communicationHandler);
