define(function(){
	var json2xml = {

		convert: function(o){
			var xml = "";
		  for (var m in o)
		  	xml += json2xml.toXml(o[m], m, "");
		  return xml;
		},

		toXml: function(v, name, ind) {
			if(name === "xmlns") return console.log("Skipping xmlns"), "";
			var xml = "";

			if (v instanceof Array) {
				for (var i=0, n=v.length; i<n; i++)
					xml += json2xml.toXml(v[i], name, ind+"");
			}

			else if (typeof(v) == "object") {
				var hasChild = false;
				xml += ind + "<" + name;
				for (var m in v) {
					if (m.charAt(0) == "@")
						xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
					else
						hasChild = true;
				}

				xml += hasChild ? ">\n" : "/>";
				//xml += hasChild ? ">\n" : "></" + name + ">";

				if (hasChild) {
					for (var m in v) {
						if (m == "#text")
							xml += json2xml.makeSafe(v[m]);
						else if (m == "#cdata")
							xml += "<![CDATA[" + json2xml.lines(v[m]) + "]]>";
						else if (m.charAt(0) != "@")
							xml += json2xml.toXml(v[m], m, ind+"\t");
					}
					xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">\n";
				}
			}

			else { // added special-character transform, but this needs to be better handled [micmath]
				xml += ind + "<" + name + ">" + json2xml.makeSafe(v.toString()) +  "</" + name + ">\n";
			}

			return xml;
		},

		lines: function(str){
			// normalise line endings, all in file will be unixy
			return str.replace(/\r\n/g, '\n');
		},

		makeSafe: function(str) {
		  // xml special charaters
		  str = str.replace(/</g, '&lt;').replace(/&/g, '&amp;');
		  return json2xml.lines(str);
		}

	};

	return json2xml.convert;
});
