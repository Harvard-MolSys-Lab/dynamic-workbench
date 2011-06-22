/**
 * @class App.Document
 * @extends Ext.data.Model
 */
Ext.define('App.Document', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'text',
		type: 'string'
	},{
		name: 'type',
		type: 'string'
	},{
		name: 'trigger',
		type: 'string',
	},{
		name: 'node',
		type: 'string'
	},{
		name: 'size',
		type: 'int'
	}
	],
	/**
	 * getPath
	 * returns the file path to this
	 */
	getPath: function() {
		return this.get('node');
	},
	getBasename: function() {
		return App.Path.basename(this.getPath());
	},
	getSibling: function(fn,scope,deep) {
		deep = deep || false;
		return this.parentNode ? this.parentNode.findChildBy.apply(this.parentNode,arguments) : false;
	},
	getSiblingByName: function(name) {
		return this.getSibling( function(node) {
			return node.get('text')==name;
		});
	},
	createSibling: function(name) {
		var parent = this.parentNode ? this.parentNode : this;
		return App.ui.filesTree.newFile(parent,name);
	},
	/**
	 * loadBody
	 * asynchonously loads the body of this file
	 */
	loadBody: function(opts) {

		(function(options,me) {
			Ext.applyIf(options, {
				success: function() {
				},
				failure: function() {
				},
				scope: window,
			});
			req = {
				url: App.getEndpoint('load'),//'/canvas/index.php/workspaces/save',
				method: 'GET',
				params: {
					node: me.getPath(),
				},
				success: function(response) {
					Ext.bind(options.success,options.scope)(response.responseText,me,response);
				},
				failure: function(response) {
					Ext.bind(options.failure,options.scope)(response.responseText,me,response);
				}
			};

			Ext.Ajax.request(req);

		})(opts,this);
	},
	/**
	 * saveBody
	 */
	saveBody: function(data,opts) {
		(function(s,options,me) {
			Ext.applyIf(options, {
				success: function() {
				},
				failure: function() {
				},
				scope: window,
			});
			req = {
				url: App.getEndpoint('save'),//'/canvas/index.php/workspaces/save',
				method: 'POST',
				params: {
					data: s,
					node: me.getPath(),
				},
				success: function(response) {
					Ext.bind(options.success,options.scope)(response.responseText,me,response);
				},
				failure: function(response) {
					Ext.bind(options.failure,options.scope)(response.responseText,me,response);
				}
			};

			Ext.Ajax.request(req);

		})(data,opts,this);
	},
	/**
	 * checkout
	 * associates this file with an opened application
	 */
	checkout: function() {

	},
});

App.DocumentStore = Ext.create('Ext.data.TreeStore', {
	model: 'App.Document',
	folderSort: true,
	autoSync: true,
	batchActions: false,
	root: {
		text: App.User.home,
		id: App.User.home,
		expanded: true,
		iconCls: 'folder',
		node: App.User.home,
	},
	proxy: {
		type: 'ajax',
		// TODO: Make these configurable
		api: {
			read:'/tree',
			create:'/new',
			update:'/rename',
			destroy: '/delete'
		},
		reader: {
			type: 'json'
		},
		writer: {
			type: 'json',
			nameProperty: 'name',
		}
	},
	/**
	 * checkout
	 * associates the passed document with the given application
	 */
	checkout: function(doc, application) {

	},
	afterEdit: function(rec) {
		rec.fireEvent('edit',rec);
		this.callParent(arguments);
	},
	afterReject: function(rec) {
		rec.fireEvent('reject',rec);
		this.callParent(arguments);
	},
	afterCommit: function(rec) {
		rec.fireEvent('commit',rec);
		this.callParent(arguments);
	},
});