/**
 * @class App
 * Manages user data and contains several utility methods
 * @singleton
 */
App = new Ext.util.Observable();

/**
 * nextId
 * Generates a random UUID
 */
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

/**
 * loadData
 * Used for bootstrapping loading of saved workspace data. This method is invoked automatically by
 * controller code; do not call directly.
 */
App.loadData = function(data) {
  App._data = data;
}

/**
 * getLoadedData
 * Retrieves loaded workspace data
 */
App.getLoadedData = function() {
  return App._data;
}


App.getDefaultWorkspace = function() {
	return App.defaultWorkspace;	
}


App.version = '0.1a';

/**
 * @class App.User
 * Contains data about the currently logged-in user
 * @singleton
 */
App.User = {
  /**
   * setUser
   * Loads data about the logged-in user. This method is invoked automatically by controller code; do not call
   * directly.
   * @param {Object} data Data blob with the keys <code>id</code>, <code>name</code>, and <code>email</code>
   */
  setUser: function(data) {
    if(data.id) {
      App.User.id = data.id;
      App.User.name = data.name;
      App.User.email = data.email;
    }
  }
};