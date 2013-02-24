

gameEngine.HUDFactory = function(player) {

	var hud = {};

	hud.itembox = $('<div id="itembox"></div>');

	$('body').append(hud.itembox);
	
	hud.healthbar = $('<div id="healthbar-inner"></div><div id="healthbar"></div>');

	$('body').append(hud.healthbar);

	hud.setHealthTo = function(quot) {
		$('#healthbar-inner').width(Math.floor(quot*168)+"px");
	};

	player.hasHealthBar = true;

	hud.itembox = $('<div id="itembox"></div>');


	$('body').append(hud.itembox);

	return hud;

};
