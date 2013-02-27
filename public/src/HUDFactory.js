

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

	//small inventory
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
			}
		}
	}


	$('body').append(hud.itembox);

	return hud;

};
