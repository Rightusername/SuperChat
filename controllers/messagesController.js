
module.exports = function (msgs) {
	return {
		add: function(msg, ip){
			msgs.push({
				message: msg,
				date: new Date(),
				user: ip
			});
		}
	}
}