/**
 * @class App.Document
 * Encapsulates a document which can be opened and edited by an {@link App.ui.Application}.
 * @extends Ext.data.Model
 */
Ext.define('App.Document', {
	extend : 'Ext.data.Model',
	fields : [{
		name : 'text',
		type : 'string'
	}, {
		name : 'type',
		type : 'string'
	}, {
		name : 'trigger',
		type : 'string',
	}, {
		name : 'node',
		type : 'string'
	}, {
		name : 'size',
		type : 'int'
	},{
		name : 'preventRename',
		type : 'bool',
		defaultValue: false,
	}],
	/**
	 * Returns the file path to this document
	 */
	getPath : function() {
		return this.get('node');
	},
	/**
	 * Returns the {@link App.Path#basename} to this document
	 */
	getBasename : function() {
		return App.Path.basename(this.getPath());
	},
	/**
	 * If this record represents a folder, returns this; otherwise returns this record's parent node.
	 * This is the moral equivalent of {@link App.path#pop}
	 */
	getFolder: function() {
		return (this.isLeaf() && !this.isRoot()) ? this.parentNode : this;
	},
	/**
	 * Searches for a sibling node to this document by the given <var>fn</var
	 * @param {Function} fn Function to search with
	 * @param {Mixed} scope Scope within which to execute <var>fn</var>
	 * @param {Boolean} deep True to search for a descendent of a sibling (defaults to false)
	 */
	getSibling : function(fn, scope, deep) {
		deep = deep || false;
		return this.parentNode ? this.parentNode.findChildBy.apply(this.parentNode, arguments) : false;
	},
	/**
	 * Searches for a sibling node with the given name
	 * @param {String} name Name to search
	 */
	getSiblingByName : function(name) {
		return this.getSibling(function(node) {
			return node.get('text') == name;
		});
	},
	/**
	 * Creates a sibling {@link App.Document}
	 */
	createSibling : function(name) {
		var parent = this.parentNode ? this.parentNode : this;
		return App.ui.filesTree.newFile(parent, name);
	},
	/**
	 * Downloads the selected file in a new window
	 */
	download : function() {
		var url = Ext.urlAppend(App.getEndpoint('load'), Ext.Object.toQueryString({
			node : this.getPath(),
			download : true,
		}));
		window.open(url, '_blank');
	},
	/**
	 * Asynchonously loads the body of this document
	 * @param {Object} opts Hash containing options to apply to the {@link Ext.Ajax#request} used to load the document
	 */
	loadBody : function(opts) {(function(options, me) {
			Ext.applyIf(options, {
				success : function() {
				},
				failure : function() {
				},
				scope : window,
			});
			req = {
				url : App.getEndpoint('load'), //'/canvas/index.php/workspaces/save',
				method : 'GET',
				params : {
					node : me.getPath(),
				},
				success : function(response) {
					Ext.bind(options.success,options.scope)(response.responseText, me, response);
				},
				failure : function(response) {
					Ext.bind(options.failure,options.scope)(response.responseText, me, response);
				}
			};

			Ext.Ajax.request(req);

		})(opts, this);
	},
	/**
	 * Asynchronously saves the body of this document
	 * @param {Mixed} data Data to save to the document body
	 * @param {Object} opts Hash containing options to apply to the {@link Ext.Ajax#request} used to load the document
	 */
	saveBody : function(data, opts) {(function(s, options, me) {
			Ext.applyIf(options, {
				success : function() {
				},
				failure : function() {
				},
				scope : window,
			});
			req = {
				url : App.getEndpoint('save'), //'/canvas/index.php/workspaces/save',
				method : 'POST',
				params : {
					data : s,
					node : me.getPath(),
				},
				success : function(response) {
					Ext.bind(options.success,options.scope)(response.responseText, me, response);
				},
				failure : function(response) {
					Ext.bind(options.failure,options.scope)(response.responseText, me, response);
				}
			};

			Ext.Ajax.request(req);

		})(data, opts, this);
	},
	/**
	 * checkout
	 * associates this file with an opened application
	 */
	checkout : function(app) {
		this.app = app;
		this.fireEvent('checkout',this,app);
	},
});

/**
 * Manages loading documents for the currently logged-in {@link App.User}
 * @singleton
 */
App.DocumentStore = Ext.create('Ext.data.TreeStore', {
	model : 'App.Document',
	folderSort : true,
	autoSync : true,
	batchActions : false,
	root : {
		text : App.User.home,
		id : App.User.home,
		expanded : true,
		iconCls : 'folder',
		node : App.User.home,
	},
	proxy : {
		type : 'ajax',
		// TODO: Make these configurable
		api : {
			read : '/tree',
			create : '/new',
			update : '/rename',
			destroy : '/delete'
		},
		reader : {
			type : 'json'
		},
		writer : {
			type : 'json',
			nameProperty : 'name',
		}
	},
	/**
	 * checkout
	 * associates the passed document with the given application
	 */
	checkout : function(doc, application) {

	},
	afterEdit : function(rec) {
		rec.fireEvent('edit', rec);
		this.callParent(arguments);
	},
	afterReject : function(rec) {
		rec.fireEvent('reject', rec);
		this.callParent(arguments);
	},
	afterCommit : function(rec) {
		rec.fireEvent('commit', rec);
		this.callParent(arguments);
	},
});
