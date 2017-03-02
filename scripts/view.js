define(function(){

	var el = function(id){
		return document.getElementById(id);
	};

	var View = {
		showing: null,
		vlanContainer: el("vlanContainer"),
		ifaceContainer: el("interfaceContainer"),

		init: function(){
			View.addMenuButtonListeners();
			View.menuItemClicked(1);
		},

		menuItemClicked: function(num){
			if(View.showing === num) return;
			View.showing = num;
			View.hideSections();

			if(num === 1)
				el("vlanContainer").className = "";
			if(num === 2)
				el("interfaceContainer").className = "";
		},

		hideSections: function(){
			View.vlanContainer.className = "hidden";
			View.ifaceContainer.className = "hidden";
		},

		addMenuButtonListeners: function(){
			var add = function(id){
				var n = num++;
				el(id).onclick = function(){
					View.menuItemClicked(n);
				};
			};

			var num = 1;
			add("vlansButton");
			add("interfacesButton");
		},

		addElementToList: function(listName, itemName, onDelete){
			var li = document.createElement("li");
			li.className = "li"

			var div = document.createElement("div");
			div.className = "element"

			var span = document.createElement("span");
			span.className = "span"
			span.innerHTML = itemName

			var button = document.createElement("input")
			button.className = "button"
			button.type = "button"
			button.value = "X"
			button.onclick = function () {
				el(listName).removeChild(li)
				onDelete && onDelete()
			}

			div.appendChild(span)
			div.appendChild(button)
			li.appendChild(div);
			el(listName).appendChild(li);
		},

		showResponseText: function(str){
			el("responseContainer").innerHTML = ""+str;
		},

		addButtonHandler: function(id, handler){
			el(id).onclick = handler;
		},

		getNameInput: function(){
			if(View.showing === 1) return el("vlanNameInput").value;
			if(View.showing === 2) return el("interfaceNameInput").value;
		},
		getIdInput: function(){
			if(View.showing === 1) return el("vlanIdInput").value;
			if(View.showing === 2) return el("interfaceIdInput").value;
		},
		getEssInput: function(){
			if(View.showing === 1) return el("vlanEstSlotSynchInput").value;
			if(View.showing === 2) return el("interfaceEstSlotSynchInput").value;
		},
		getEstInput: function(){
			if(View.showing === 1) return el("vlanEstDirectInput").value;
			if(View.showing === 2) return el("interfaceEstDirectInput").value;
		}
		
	};

	View.init();
	return View;
});
