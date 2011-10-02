/** 
 * Requires code and dependencies for all applications. Used to build 1 compressed JS file for the app.
 */
Ext.require(['App.ui.Launcher']);
Ext.onReady(function() {
Ext.require(_.map(App.ui.Launcher.getLaunchers(), function(config) {
	return config.cls;
}));	
});
