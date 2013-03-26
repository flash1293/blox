gameEngine = gameEngine || {};
/**
* Handles the multiplayer-part via socket-io
*
* @module Blox
* @submodule Controlling
* @class SocketHandler
*/
gameEngine.socketHandler = {
	/**
	 * handles an init-data-package from server
	 * @method handleInit
	 * @param {Object} Data sent from the server
	 * */
	handleInit: function(data) {
		gameEngine.myId = data.id;
		gameEngine.log("My ID is "+data.id);
		var lastChange = gameEngine.get("lastChange") || 0;
		if(data.startUp > lastChange) {
			gameEngine.log("server restarted after you left the game (or you've never visited the server), discarding local cache");
			gameEngine.set("mapChanges",[]);
		} else {
			var mapChanges = gameEngine.get("mapChanges") || [];
			for(var i=0;i<mapChanges.length;i++) {
				var change = mapChanges[i];
				gameEngine.socketHandler.handleBlockChange(change,true);
			}
		}
	},
	/**
	 * handles an update-data-package from server
	 * @method handleUpdate
	 * @param {Object} Data sent from the server
	 * */
	handleUpdate: function(data) {
		gameEngine.log('handle position-update');
		gameEngine.players[data.id].markDx = data.markDx;
		gameEngine.players[data.id].markDy = data.markDy;
	
		gameEngine.players[data.id].sprite.x = data.x;
	
		if(!gameEngine.isInTolerance(gameEngine.players[data.id].sprite.y, data.y)) {
			gameEngine.players[data.id].sprite.y = data.y;
			gameEngine.players[data.id].can_jump = false;
		}
	},
	/**
	 * handles an new-data-package from server
	 * @method handleNew
	 * @param {Object} Data sent from the server
	 * */
	handleNew: function(data) {
		if(data.id != gameEngine.myId) {
			gameEngine.log("add new player #"+data.id);
			var player = gameEngine.PlayerFactory({x: data.data.x, y: data.data.y, type: data.data.type, controllMode: 'none'});
			//add him to the players-list (activate him)
			gameEngine.players[data.id] = player;
		} else {
			gameEngine.log("add myself??! hell no");
		}
	},
	/**
	 * handles an remove-data-package from server
	 * @method handleRemove
	 * @param {Object} Data sent from the server
	 * */
	handleRemove: function(data) {
		gameEngine.log("remove player #"+data.id);
		gameEngine.players[data.id] = undefined;
	},
	/**
	 * handles an block-remove-data-package from server
	 * @method handleBlockRemove
	 * @deprecated
	 * @param {Object} Data sent from the server
	 * */
	handleBlockRemove: function(data) {
		gameEngine.log("block removed by other player: "+data.x+","+data.y);
		gameEngine.world.clearCell(data.x,data.y);
	},
	/**
	 * handles an block-data-package from server
	 * @method handleBlockChange
	 * @param {Object} Data sent from the server
	 * @param {Boolean} indicates whether the data should be written to local caching
	 * */
	handleBlockChange: function(data,cacheIgnore) {
		if(data.loadComplete && config.multiplayer) { 
			jaws.game_loop.unpause(); 
			$('#waiting').hide();
			return; }
		gameEngine.log("block changed by "+(cacheIgnore?"cache":"other player")+": "+data.x+","+data.y);
		var lastChange = gameEngine.get("lastChange") || 0;
		if(lastChange < data.ts) {
			gameEngine.set("lastChange",data.ts);
		}
		if(!cacheIgnore) {
			var mapChanges = gameEngine.get("mapChanges") || [];
			mapChanges.push({x: data.x, y:data.y, type: data.type, ts: Date.now()});
			gameEngine.set("mapChanges",mapChanges);
		}
		gameEngine.world.clearCell(data.x,data.y);
		var newBlock = gameEngine.BlockFactory({x:data.x,y:data.y,type:data.type});
		gameEngine.world.push(newBlock.sprite);
	},
	/**
	 * handles an chat-data-package from server
	 * @method handleChat
	 * @param {Object} Data sent from the server
	 * */
	handleChat: function(data) {
		gameEngine.log("received chat message");
		gameEngine.hud.addChatMessage(data.player,data.msg);
	}
};