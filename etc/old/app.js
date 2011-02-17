App = new Ext.util.Observable();

App.nextId = function(){
	// if the time isn't unique enough, the addition 
	// of random chars should be
	var t = String(new Date().getTime()).substr(4);
	var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i = 0; i < 4; i++){
		t += s.charAt(Math.floor(Math.random()*26));
	}
	return t;
}

App.getDefaultWorkspace = function() {
	return App.defaultWorkspace;	
}

App.Tools = (function() {
	var tools = {};
	return {
		register: function(toolName, toolClass) {
			tools[toolName] = toolClass;
		},
		getToolClass: function(toolName) {
			return tools[toolName];	
		}
	};
})();

App.getNewTool = function(toolName,workspace,config) {
	var toolClass = App.Tools.getToolClass(toolName);
	return new toolClass(workspace,config);
}
