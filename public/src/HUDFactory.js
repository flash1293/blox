gameEngine = gameEngine || {};
/**
* A class for the HUD of the active player
*
* @module Blox
* @submodule Game
* @class HUD
* @constructor
* @param {Player} player The player tied to the hud 
*/
gameEngine.HUD = function(player) {
	var container = [];
	//handle player
	this.tiedPlayer = player;
	player.hasHealthBar = true;
	//create itembox
	this.itembox = $("<div id='itembox'></div>");
	for(var i=0;i<9;i++) {
		var itemwrapper = $("<div id='itembox-"+i+"'></div>").addClass('itemwrapper').data("id",i);
		this.itembox.append(itemwrapper);
	}
	container.push(this.itembox);
	//big inventory
	this.inventory = $("<div id='inventory'></div>").hide();
	for(var i=0;i<36;i++) {
		var itemwrapper = $("<div id='inventory-"+i+"'></div>").addClass('itemwrapper').data("id",i);
		this.inventory.append(itemwrapper);
	}
    this.inventory.append("<div id='trash'></div>");
	container.push(this.inventory);
	//create healthbar
	this.healthbar = $('<div id="healthbar"></div>');
	container.push(this.healthbar);
	this.healthbarInner = $('<div id="healthbar-inner"></div>');
	container.push(this.healthbarInner);
	//create buttons/chat
	this.chatbox = $('<div id="chatbox"></div>');
	container.push(this.chatbox);
	this.buttonbox= $('<div id="buttonbox"></div>');
	var chatButton = $('<div id="chat"></div>').addClass("button").html("T");
	chatButton.click(player.chat);
	this.buttonbox.append(chatButton);
	var iButton = $('<div id="inventory_btn"></div>').addClass("button").html("I");
	iButton.click(gameEngine.showInventory);
	this.buttonbox.append(iButton);
	if(!config.multiplayer) {
		var shareButton = $('<div id="share"></div>').addClass("button").html("S");
		shareButton.click(gameEngine.shareMap);
		this.buttonbox.append(shareButton);
	}
	container.push(this.buttonbox);
	
	//append all containers to body
	var body = $('body');
	$(container).each(function(i,el) { body.append(el);});
	
};

/**
* Sets the length of the healthbar to a percentage-value
* @method setHealthTo
* @param {Double} quot percentage of the current health / max health
*/
gameEngine.HUD.prototype.setHealthTo = function(quot) {
	this.healthbarInner.width(Math.floor(quot*168)+"px");
};

gameEngine.HUD.prototype.enableDragDrop = function() {
	//define object for drag-info in this closjure
	var dragInformation = {
		fromElement: null, //source-container-element
		toElement: null //target-container element
	};
	var that = this;
	$('.item').draggable({
		revert: "invalid", //reset if dropped in nirvana
		stop: function( ev ) {
			//normalize item-position
			$(ev.target).css({"left": 0, "top": 0});
		},
		start: function( ev ) {
			dragInformation.fromElement = ev.target.parentElement;
			dragInformation.toElement = null;
		}
	});
    var dropHandler = function(ev) { 
        that.handleItemDrop(ev,dragInformation,ev.target.id == "trash"); 
    };
    $('#trash').droppable({
        drop: dropHandler
    });
	$('.itemwrapper').droppable({
		drop: dropHandler
	});
};

gameEngine.HUD.prototype.handleItemDrop = function(ev,dragInformation, isTrash) {
    dragInformation.toElement = ev.target;

    var fromIndex = this.getSmallInventoryIndex(dragInformation.fromElement.id);
    var isFromBigInventory = fromIndex == -1;
    if(isFromBigInventory) {
        fromIndex = this.getBigInventoryIndex(dragInformation.fromElement.id);
    }
    
    if(isTrash) {
        this.tiedPlayer.removeItem(Number(fromIndex),isFromBigInventory);
    } else {        
        var toIndex = this.getSmallInventoryIndex(dragInformation.toElement.id);
        var isToBigInventory = toIndex == -1;
        if(isToBigInventory) {
            toIndex = this.getBigInventoryIndex(dragInformation.toElement.id);
        }
        
        this.tiedPlayer.moveItemFromSlotToSlot(
            Number(fromIndex),
            isFromBigInventory,
            Number(toIndex),
            isToBigInventory);
    }
};

/**
* Updates the itembox to the current value in the players inventory
* @method updateItembox
*/
gameEngine.HUD.prototype.updateItembox = function(includeInventory) {
	gameEngine.log("update itembox");
	for(var i=0;i<9;i++) {
		var item = this.tiedPlayer.smallInventory[i];
		if(item !== undefined) {
			this.updateItemWrapper($('#itembox-'+i), item)
		} else {
			$('#itembox-'+i).html('');
		}

		if(this.tiedPlayer.selectedItem == i) {
			$('#itembox-'+i).addClass('selected');
		} else {
			$('#itembox-'+i).removeClass('selected');
		}
	}
	if(includeInventory) {
		for(var i=0;i<36;i++) {
			var item = this.tiedPlayer.bigInventory[i];
			if(item !== undefined) {
				this.updateItemWrapper($('#inventory-'+i), item);
			} else {
				$('#inventory-'+i).html('');
			}
		}
	}
	if(gameEngine.hud.inventory.is(":visible")) this.enableDragDrop();
};

gameEngine.HUD.prototype.getSmallInventoryIndex = function(id) {
	if(id.indexOf("itembox") == -1) return -1;
	return id.substring(id.indexOf("-")+1);
};

gameEngine.HUD.prototype.getBigInventoryIndex = function(id) {
	if(id.indexOf("inventory") == -1) return -1;
	return id.substring(id.indexOf("-")+1);
};

gameEngine.HUD.prototype.updateItemWrapper= function(el, item) {
	var html= "<div class=\"item\" style=\"background-image:url(assets/items/"+item.staticInfo.sprite+")\"><div class=\"amount\">"+item.amount+"</div></div>"; 
	if(el.html() != html) {
		el.html(html);
        el.unbind("click");
		el.click(this.handleItemClick);  
	}
};

/**
* Handles a click on an item. Use as event-handler
* @method handleItemClick
*/
gameEngine.HUD.prototype.handleItemClick = function(ev) {
	if(gameEngine.hud.inventory.is(":visible")) return;
	var i = $(this).data('id');
	gameEngine.hud.tiedPlayer.selectedItem = i;
	var item = gameEngine.hud.tiedPlayer.smallInventory[i];
	gameEngine.hud.updateItembox();
    if(gameEngine.touchPlace === true) {
        gameEngine.touchPlace = false;
        if(gameEngine.hud.tiedPlayer.controllMode == "touch") $('#placenow').hide();
    } else if(item.staticInfo.toBlock != "") {
		gameEngine.touchPlace = true;
		if(gameEngine.hud.tiedPlayer.controllMode == "touch") $('#placenow').show();
	}
    ev.preventDefault();
}

/**
* Adds a chat-message to the chat-box. it will only last config.chatDelay ms
* @param {String} sender the sender of the message
* @param {String} message the message to display
* @method addChatMessage
*/
gameEngine.HUD.prototype.addChatMessage = function(sender,message) {
	var id = 'cm-'+Date.now();
	var message = $('<div id='+id+'>'+sender+': '+message+'</div>');
	$('#chatbox').append(message);
	setTimeout(function(){ gameEngine.log("remove chat-message"); $('#'+id).remove();  },config.chatDelay);
};
	

gameEngine.HUDFactory = function(player) {
	return new gameEngine.HUD(player);
};
