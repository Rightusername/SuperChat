function MsgModel () {
	this.messages = [];
	this.maxLength = 100;


}

MsgModel.prototype.add = function(msg, ip, id){
	if(this.messages.length >= this.maxLength){
		this.messages.splice(0,this.messages.length-this.maxLength);
	}
	this.messages.push({
		message: msg,
		date: new Date(),
		ip: ip,
		id: id
	});
}

module.exports = new MsgModel();