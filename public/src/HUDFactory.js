

gameEngine.HUDFactory = function(player) {

	var hud = {};

	hud.tiedPlayer = player;

	hud.itembox = $('<div id="itembox"></div>');

	$('body').append(hud.itembox);
	
	hud.healthbar = $('<div id="healthbar-inner"></div><div id="healthbar"></div>');

	$('body').append(hud.healthbar);

	hud.setHealthTo = function(quot) {
		$('#healthbar-inner').width(Math.floor(quot*168)+"px");
	};

	player.hasHealthBar = true;

	var itemboxcode = "<div id='itembox'>";
	for(var i=0;i<9;i++) {
		itemboxcode += "<div id='itembox-"+i+"' class='itemwrapper'></div>";
	}
	itemboxcode += "</div>";
	hud.itembox = $(itemboxcode);

	hud.updateItembox = function() {
		gameEngine.log("update itembox");
		for(var i=0;i<9;i++) {
			var item = this.tiedPlayer.smallInventory[i];
			if(item !== undefined) {

				var html= "<div class='item' style='background-image:url(assets/items/"+item.staticInfo.sprite+")'><div class='amount'>"+item.amount+"</div></div>";
				$('#itembox-'+i).html(html); 
			} else {
				$('#itembox-'+i).html('');
			}

			if(this.tiedPlayer.selectedItem == i) {
				$('#itembox-'+i).addClass('selected');
			} else {
				$('#itembox-'+i).removeClass('selected');
			}


		}
	}


	$('body').append(hud.itembox);
	
	hud.chatbox = $('<div id="chatbox"></div>');

	$('body').append(hud.chatbox);


	hud.addChatMessage = function(sender,message) {
		var id = 'cm-'+Date.now();
		var message = $('<div id='+id+'>'+sender+': '+message+'</div>');
		$('#chatbox').prepend(message);
		setTimeout(function(){ gameEngine.log("remove chat-message"); $('#'+id).remove();  },config.chatDelay);
	};
	
	hud.buttonbox= $('<div id="buttonbox"></div>');

	$('body').append(hud.buttonbox);
	
	var chatButton = $('<div id="chat" class="button">T</div>');
	$('#buttonbox').append(chatButton);
	$('#chat').click(player.chat);

	return hud;

};
