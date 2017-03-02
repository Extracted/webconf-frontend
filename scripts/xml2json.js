define(function(){
	var EXCLUDE_XMLNS = true
	
	var xml2json = {

		convert: function(xmlStr){
			return xml2json.recurse(xml2json.clean(xmlStr), 0);
		},

		recurse: function(xmlStr){
			var obj = {};
			var tagName, indexClosingTag, inner_substring, tempVal, openingTag;

			while (xmlStr.match(/<[^\/][^>]*>/)) {
				openingTag = xmlStr.match(/<[^\/][^>]*>/)[0];
				tagName = openingTag.substring(1, openingTag.length - 1);
				indexClosingTag = xmlStr.indexOf(openingTag.replace('<', '</'));

		        // account for case where additional information in the opening tag
		        if (indexClosingTag == -1) {
		        	tagName = openingTag.match(/[^<][\w+$]*/)[0];
		        	indexClosingTag = xmlStr.indexOf('</' + tagName);
		        	if (indexClosingTag == -1)
		        		indexClosingTag = xmlStr.indexOf('<\\/' + tagName);
		        }
		        inner_substring = xmlStr.substring(openingTag.length, indexClosingTag);
		        if (inner_substring.match(/<[^\/][^>]*>/))
		        	tempVal = xml2json.convert(inner_substring);
		        else
		        	tempVal = inner_substring;

		        // account for array or obj //
		        if (obj[tagName] === undefined)
		        	obj[tagName] = tempVal;
		        else if (Array.isArray(obj[tagName]))
		        	obj[tagName].push(tempVal);
		        else
		        	obj[tagName] = [obj[tagName], tempVal];

		        xmlStr = xmlStr.substring(openingTag.length * 2 + 1 + inner_substring.length);
		    }

		    return obj;
		},

		clean: function(xmlStr){
			xmlStr = xmlStr.replace( /<!--[\s\S]*?-->/g, '' ); //remove commented lines
		    xmlStr = xmlStr.replace(/\n|\t|\r/g, ''); //replace special characters
		    xmlStr = xmlStr.replace(/ {1,}<|\t{1,}</g, '<'); //replace leading spaces and tabs
		    xmlStr = xmlStr.replace(/> {1,}|>\t{1,}/g, '>'); //replace trailing spaces and tabs
		    xmlStr = xmlStr.replace(/<\?[^>]*\?>/g, ''); //delete docType tags

		    xmlStr = xml2json.replaceSelfClosingTags(xmlStr); //replace self closing tags
		    xmlStr = xml2json.replaceAloneValues(xmlStr); //replace the alone tags values
		    xmlStr = xml2json.replaceAttributes(xmlStr); //replace attributes

		    return xmlStr;
		},

		replaceSelfClosingTags: function(xmlStr){
			var selfClosingTags = xmlStr.match(/<[^/][^>]*\/>/g);

			if (selfClosingTags) {
				for (var i = 0; i < selfClosingTags.length; i++) {

					var oldTag = selfClosingTags[i];
					var tempTag = oldTag.substring(0, oldTag.length - 2);
					tempTag += ">";

					var tagName = oldTag.match(/[^<][\w+$]*/)[0];
					var closingTag = "</" + tagName + ">";
					var newTag = "<" + tagName + ">";

					var attrs = tempTag.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);

					if (attrs) {
						for(var j = 0; j < attrs.length; j++) {
							var attr = attrs[j];
							var attrName = attr.substring(0, attr.indexOf('='));
							var attrValue = attr.substring(attr.indexOf('"') + 1, attr.lastIndexOf('"'));

							newTag += "<" + attrName + ">" + attrValue + "</" + attrName + ">";
						}
					}

					newTag += closingTag;

					xmlStr = xmlStr.replace(oldTag, newTag);
				}
			}

			return xmlStr;
		},

		replaceAloneValues: function(xmlStr) {

			var tagsWithAttributesAndValue = xmlStr.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>{1}([^<]+)/g);

			if (tagsWithAttributesAndValue) {
				for(var i = 0; i < tagsWithAttributesAndValue.length; i++) {

					var oldTag = tagsWithAttributesAndValue[i];
					var oldTagName = oldTag.substring(0, oldTag.indexOf(">") + 1);
					var oldTagValue = oldTag.substring(oldTag.indexOf(">") + 1);

					var newTag = oldTagName + "<_@ttribute>" + oldTagValue + "</_@ttribute>";

					xmlStr = xmlStr.replace(oldTag, newTag);
				}
			}

			return xmlStr;
		},

		replaceAttributes: function(xmlStr){
			var tagsWithAttributes = xmlStr.match(/<[^\/][^>][^<]+\s+.[^<]+[=][^<]+>/g);

			if (tagsWithAttributes) {
				for (var i = 0; i < tagsWithAttributes.length; i++) {

					var oldTag = tagsWithAttributes[i];
					var tagName = oldTag.match(/[^<][\w+$]*/)[0];
					var newTag = "<" + tagName + ">";
					var attrs = oldTag.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);

					if (attrs) {
						for(var j = 0; j < attrs.length; j++) {

							var attr = attrs[j];
							var attrName = attr.substring(0, attr.indexOf('='));
							var attrValue = attr.substring(attr.indexOf('"') + 1, attr.lastIndexOf('"'));

							if(attrName !== "xmlns" || !EXCLUDE_XMLNS){
								newTag += "<" + attrName + ">" + attrValue + "</" + attrName + ">";
							}
						}
					}

					xmlStr = xmlStr.replace(oldTag, newTag);
				}
			}

			return xmlStr;
		}

	};

	return xml2json.convert;
});
