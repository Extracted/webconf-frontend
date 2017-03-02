define(["webconf", "view", "xml2json", "json2xml"], function(webconf, view, x2j, j2x){
	init(view, x2j, j2x);
});

var original_config_xml;
var config = {};

var View;
var xml2json;
var json2xml;

var init = function(v, x2j, j2x){
	View = v;
	xml2json = x2j;
	json2xml = j2x;

	setServer(function(){
		getConfig(function(config){
			original_config_xml = config;
			onConfigReceived();
		});
	});

	View.addButtonHandler("addVlan", addVlan);
	View.addButtonHandler("addInterface", addInterface);
	View.addButtonHandler("saveButton", save);
};

var setServer = function(callback){
	var getURLParameter = function(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}

	var server = getURLParameter("server") || "127.0.0.1";
	var user = getURLParameter("username") || "root";
	var pass = getURLParameter("password") || "mypass";

	if(server === "127.0.0.1" && user === "root" && pass === "mypass"){
		console.log("No ip, user or pass parameters set, using default values: \n"+
			"server: "+server+ ", username: "+user+", password: "+pass);
		return callback && callback();
	}

	console.log("Sending setserver request with values: \n"+
		"server: "+server+ ", username: "+user+", password: "+pass);
	var req = new XMLHttpRequest();
	req.addEventListener("load", function(){
		callback && callback(this.responseText);
	});
	req.open("GET", "./setup?server="+server+"&username="+user+"&password="+pass);
	req.send();
}

var getConfig = function(callback){
	console.log("Sending config request");
	var req = new XMLHttpRequest();
	req.addEventListener("load", function(){
		callback && callback(this.responseText);
	});
	req.open("GET", "./getconfiguration");
	req.send();
}

var onConfigReceived = function(){
	config = xml2json(original_config_xml);
	config = config.config; // Get the actual config element. We need to put config data back in a config tag before saving

	//console.log("Config in raw xml: \n", original_config_xml);
	console.log("Config in js object: \n", config);
	View.showResponseText(original_config_xml);

	if(config.vlans && config.vlans.vlan && Array.isArray(config.vlas.vlan)){
		
	}

	var vlans = config.vlans.vlan
	for(var i in vlans) {
		var vlan = vlans[i]
		var nameString = vlan.id + ": " + vlan.name
		View.addElementToList("vlans", nameString, function() {
			onVlanDeleted(vlan.id)
		})
	}
}

var save = function(){
	console.log("Saving");
	var uploadData = config;
	//var uploadData = {}; //Upload only new stuff

	uploadData = { config: uploadData } // Put config data under a "config" tag

	uploadData = JSON.parse(JSON.stringify(uploadData)); //Get as json

	var xml = json2xml(uploadData);
	console.log("Json of data being uploaded: ", uploadData);
	console.log("Uploading this xml: \n", xml);

	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/editconfig", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.addEventListener("load", function(){
		View.showResponseText(this.responseText);
		console.log("Response in json: ", xml2json(this.responseText));
	});
	xhttp.send("config=" + encodeURIComponent(xml));
}

var addVlan = function(){
	var id = View.getIdInput()
	var name = View.getNameInput()

	config.vlans.vlan = config.vlans.vlan || [];
	config.vlans.vlan.push({
		name: 	name,
		id: 	id
		//ess: document.getElementById("vlanEstSlotSynchInput").value,
		//edi: document.getElementById("vlanEstDirectInput").value
	});

	View.addElementToList("vlans", id+": "+name, function() {
		onVlanDeleted(id)
	})
}

var addInterface = function(){
	var obj = makeItem();
	//obj.ess = document.getElementById("interfaceEstSlotSynchInput").value,
	//obj.edi = document.getElementById("interfaceEstDirectInput").value,
	//obj.type = "ianaift:ethernetCsmacd"

	addItem(obj, "interfaces");
}

var onVlanDeleted = function(id) {
	console.log("Vlan with id " + id + " deleted")
	var vlans = config.vlans.vlan
	for(var i  = vlans.length-1; i >= 0; i--){
		if(vlans[i].id === id){
			vlans.splice(i, 1)
		}
	}
}
