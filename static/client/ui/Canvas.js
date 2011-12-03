/**
 * @class App.ui.Canvas
 * The application interface. Responsible for constructing a {@link Workspace} object, managing user interface controls which appear
 * outside the Workspace area itself (such as the Object tree and Ribbon UI)
 * @extends Ext.Panel
 */
Ext.define('App.ui.Canvas', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	alias: 'widget.canvas',
	editorType: 'Whiteboard',
	iconCls: 'whiteboard',
	requires: ['App.ui.Ribbon','App.ui.ObjectTree','App.ui.MotifPalette','App.ui.ObjectProperties',],
	border: false,
	mixins: {
		app: 'App.ui.Application'
	},
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function(config) {

		// set defaults
		Ext.applyIf(this, {
			workspaceData: {},
			palettes: [],
			inspectors: [],
		});

		Ext.apply(this, {
			items: [{
				xtype: 'ribbon',
				// North region: Ribbon interface
				region: 'north',
				height: 100,
				ref: 'ribbon',
				collapseMode: 'mini',
				canvas: this,
				items: this.ribbonItems || null,
				margins: '0 0 5 0',
			},{

				// Center region: workspace canvas
				region: 'center',
				xtype: 'panel',
				ref: 'bodyPanel',
				autoScroll: true,
				bbar: {
					items: ['->','Zoom:&nbsp;',{
						ref: 'zoomField', //ref: '../../zoomField',
						xtype: 'slider',
						value: 1,
						minValue: 0.25,
						maxValue: 4,
						decimalPrecision: 2,
						animate: true,
						plugins: Ext.create('Ext.slider.Tip',{
							getText: function(thumb) {
								return String.format('{0}%', thumb.value * 100);
							}
						}),
						width: 100,
						tooltip: {
							title: 'Zoom',
							text: 'Workspace zoom'
						}
					}]
				}
				/*
				bbar: new Ext.ux.StatusBar({
				ref: '../statusBar'
				})
				*/
				// West region: Tree of objects
			},{
				region: 'west',
				// margins: '0 0 0 5',
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				preventHeader: true,
				border: false,
				width: 200,
				layout: 'border',
				items: [Ext.create('App.ui.ObjectTree',{
					region: 'center',
					ref: 'objectTree', //'../objectTree',
					border: true,
					frame: false,
					split: true,
					collapsible: true,
					collapseMode: 'header',
					titleCollapse: true,
					title: 'Objects',
					root: {
						text: 'Workspace',
						id: 'workspace',
						nodeType: 'node'
					}
				}), {
					xtype: 'tabpanel',
					preventHeader: true,
					plain: true,
					title: 'Palettes',
					ref: 'palettes',
					region: 'south',
					height: 300,
					split: true,
					collapsible: true,
					titleCollapse: true,
					border: true,
					frame: false,
					items: this.palettes,
					collapsed: (this.palettes.length > 0),
				}]
			}, Ext.create('App.ui.ObjectProperties',{
				ref: 'objectProperties',
				width: 250,
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				titleCollapse: true,
				border: true,
				frame: false,
				region: 'east',
				items:this.inspectors,
			}), ]
		});
		
		this.callParent(arguments);
		_.each(['ribbon', 'bodyPanel','zoomField','objectTree','palatte','objectProperties'], function(item) {
			this[item] = this.down('*[ref='+item+']');
		},this);
		// build interface on render
		this.bodyPanel.on('render', function() {

			// // mask workspace while deserializing
			// var mask = new Ext.LoadMask(this.bodyPanel.body, {
			// msg: 'Loading Workspace...'
			// });

			this.loadWorkspace();

			this.zoomField.on('change',this.zoomWorkspace,this);

		},
		this);

	},
	/**
	 * Proxies {@link #loadFile}.
	 */
	loadWorkspace: function() {
		this.loadFile();
		// this.loadingMask = new Ext.LoadMask(this.bodyPanel.body, {
		// msg: 'Loading Workspace...'
		// });
		// if(this.doc) {
		// this.loadingMask.show();
		// this.doc.loadBody({
		// success: this.onLoad,
		// failure: this.onLoadFail,
		// scope: this
		// });
		// } else {
		// this.workspaceData = {};
		// this.doLoad();
		// }
		// if(this.path) {
		// this.loadingMask.show();
		// if(App.User.isLoggedIn()) {
		// Ext.Ajax.request({
		// url: App.getEndpoint('load'),//'/canvas/index.php/workspaces/save',
		// method: 'GET',
		// params: {
		// node: this.path,
		// },
		// success: this.onLoad,
		// failure: this.onLoadFail,
		// scope: this
		// });
		// } else {
		// Ext.log('Not logged in; could not load saved workspace from server. Opening blank workspace.');
		// }
		// } else {
		// this.workspaceData = {};
		// this.doLoad();
		// }
	},
	// onLoad: function(text) {
	// this.workspaceData = Ext.isEmpty(text) ? {} : Ext.decode(text);
	// this.doLoad();
	// },
	autoHideLoadingMask: false,
	/**
	 * Builds the {@link Workspace} with the data loaded from the {@link App.Document} body
	 */
	onLoad: function() {
		this.workspaceData = Ext.isEmpty(this.data) ? {} : Ext.decode(this.data);
		this.workspaceData.path = this.getPath();

		// build workspace, using loaded data bootstrapped from App.loadData
		this.workspace = new Workspace(this.bodyPanel.body, this.workspaceData);
		this.workspace.on('afterload', function() {
			this.setupWorkspace();

			this.loadingMask.hide();
			// deprecated
			this.bodyPanel.on('bodyresize', function(c, w, h) {
				this.workspace.bodyResize(c,w,h);
			}, this);
			this.bodyPanel.on('resize', function(c,w,h) {
				this.workspace.bodyResize(c,this.bodyPanel.body.getWidth(),this.bodyPanel.body.getHeight());
			},this);
			// deprecated
			App.defaultWorkspace = this.workspace;

			// attach ribbon and object property grid to workspace to allow it to respond to selections
			this.ribbon.attachTo(this.workspace);
			this.objectProperties.attachTo(this.workspace);

			// attach tree to workspace to allow it to mirror selection
			this.objectTree.attachTo(this.workspace);

			this.workspace.bodyResize(this.bodyPanel,this.bodyPanel.body.getWidth()-10,this.bodyPanel.body.getHeight()-10);

		}, this, {
			single: true
		});
	},
	/**
	 * Called after workspace is created and loaded
	 */
	setupWorkspace: function() {
		
	},
	/**
	 * Serializes, encodes, and saves the workspace to the server (proxies {@link #saveFile}).
	 */
	saveWorkspace: function() {
		this.saveFile();
	},
	/**
	 * Serializes the workspace to save
	 */
	getSaveData: function() {
		return this.workspace.serialize();
	},
	/**
	 * Zooms the workspace to the given zoom value
	 */
	zoomWorkspace: function(s,v) {
		this.workspace.zoomTo(v);
	}
});