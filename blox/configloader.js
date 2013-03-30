module.exports = function(conf) {
	var configJS = "config = "+JSON.stringify(conf)+";";
	return configJS;
}
