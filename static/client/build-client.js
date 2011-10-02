Ext.require(['App.ui.Launcher']);
Ext.onReady(function() {
Ext.require(_.map(App.ui.Launcher.getLaunchers, function(config) {
	return config.cls;
}));	
});
