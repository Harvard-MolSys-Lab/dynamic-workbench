/**
 * The application interface. Responsible for constructing a {@link Workspace} object, managing user interface controls which appear
 * outside the Workspace area itself (such as the Object tree and Ribbon UI)
 */
Ext.define('App.usr.canvas.Canvas', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	alias: 'widget.canvas',
	editorType: 'Whiteboard',
	iconCls: 'whiteboard',
	requires: ['App.usr.canvas.Ribbon','App.usr.canvas.ObjectTree','App.usr.nodal.MotifPalette','App.usr.canvas.ObjectProperties',],
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
			bbarItems: [],
		});

		Ext.apply(this, {
			items: [{
				// North region: Ribbon interface
				xtype: 'ribbon',
				region: 'north',
				height: 100,
				/**
				 * @property {App.usr.canvas.Ribbon} ribbon
				 * Strip containing various tabs related to objects in the workspace. The ribbon should provide actions
				 * relevant to the selection.
				 */
				ref: 'ribbon',
				collapseMode: 'mini',
				canvas: this,
				/**
				 * @cfg {Ext.panel.Panel[]/App.ui.BoundObjectPanel[]} ribbonItems
				 * Array containing components or config objects to be added to this canvas' #ribbon.
				 */
				items: this.ribbonItems || null,
				margins: '0 0 5 0',
			},{

				// Center region: workspace canvas
				region: 'center',
				xtype: 'panel',
				/**
				 * @property {Ext.panel.Panel} bodyPanel
				 * Panel into which the #workspace is rendered.
				 */
				ref: 'bodyPanel',
				autoScroll: true,
				bbar: {
					items: this.bbarItems.concat(['->','Zoom:&nbsp;',{
						/**
						 * @property {Ext.slider.Single} zoomField
						 */
						ref: 'zoomField', //ref: '../../zoomField',
						xtype: 'slider',
						value: 1,
						minValue: 0.2,
						maxValue: 4,
						decimalPrecision: 2,
						increment: 0.1,
						animate: true,
						plugins: Ext.create('Ext.slider.Tip',{
							getText: function(thumb) {
								return Ext.String.format('{0}%', thumb.value * 100);
							}
						}),
						width: 100,
						tooltip: {
							title: 'Zoom',
							text: 'Workspace zoom'
						}
					}])
				}
			},{
				// West region: Tree of objects
				region: 'west',
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				preventHeader: true,
				border: false,
				width: 200,
				layout: 'border',
				items: [Ext.create('App.usr.canvas.ObjectTree',{
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
					/**
					 * @property {Ext.tab.Panel} palettes
					 * Tabbed panel containing a set of palettes containing objects which can be dragged 
					 * and dropped onto the workspace canvas. Palettes can be configured with {@link #cfg-palettes}
					 */
					ref: 'palettes',
					region: 'south',
					height: 400,
					split: true,
					collapsible: true,
					titleCollapse: true,
					border: true,
					frame: false,
					/**
					 * @cfg {App.usr.canvas.Palette[]} palettes
					 * Array of components or config objects for palettes containing objects which can be 
					 * dragged and dropped onto the workspace canvas. Palettes will be rendered into 
					 * {@link #property-palettes}
					 */
					items: this.palettes,
					collapsed: (this.palettes.length == 0),
				}]
			}, Ext.create('App.usr.canvas.ObjectProperties',{
				/**
				 * @property {App.usr.canvas.ObjectProperties} objectProperties
				 * Contains the {@link #inspectors}.
				 */
				ref: 'objectProperties',
				width: 250,
				split: true,
				collapseMode: 'mini',
				collapsible: true,
				titleCollapse: true,
				border: true,
				frame: false,
				region: 'east',
				/**
				 * @cfg {App.ui.BoundObjectPanel[]} inspectors
				 * Array of components of config objects for inspectors which are used to view and edit
				 * properties of selected objects.
				 */
				items:this.inspectors,
			}), ]
		});
		
		this.callParent(arguments);
		_.each(['ribbon', 'bodyPanel','zoomField','objectTree','palatte','objectProperties'], function(item) {
			this[item] = this.down('*[ref='+item+']');
		},this);
		
		// build interface on render
		this.bodyPanel.on('render', function() {

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
		
	},
	/**
	 * @cfg
	 * True to automatically hide the loading mask
	 */
	autoHideLoadingMask: false,

	/**
	 * Override to provide custom logic upon the creation of a new (blank) workspace. 
	 * This is called by #onLoad if the passed #data from the loaded file is empty.
	 */
	createBlankWorkspace: function () {
		return {}
	},
	/**
	 * Builds the {@link Workspace} with the data loaded from the {@link App.Document} body
	 */
	onLoad: function() {
		this.workspaceData = Ext.isEmpty(this.data) ? this.createBlankWorkspace() : Ext.decode(this.data);
		this.workspaceData.path = this.getPath();

		/**
		 * @property {Workspace} workspace
		 * Reference to the {@link Workspace} object which manages objects on the canvas.
		 */

		// TEMPORARY PROFILING
		//console.profile('Workspace loading')

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

			//console.profileEnd('Workspace loading')
		}, this, {
			single: true
		});
		
	},
	/**
	 * Called after the #workspace is created and loaded. Override to provide custom logic on workspace creation.
	 */
	setupWorkspace: function() {
		
	},
	/**
	 * Serializes, encodes, and saves the #workspace to the server (proxies {@link #saveFile}).
	 */
	saveWorkspace: function() {
		this.saveFile();
	},
	/**
	 * Serializes the #workspace to save
	 */
	getSaveData: function() {
		return this.workspace.serialize();
	},
	/**
	 * Zooms the #workspace to the given zoom value
	 * @param {Ext.slider.Single} slider Reference to the #zoomSlider
	 * @param {Number} value Zoom value (1 = 100%, 2 = 100%, etc.)
	 */
	zoomWorkspace: function(s,v) {
		this.workspace.zoomTo(v);
	},
	popup: function () {
		var text = this.bodyPanel.body.dom.innerHTML
		$.get('/popup.html',function(html) {
			html = html.replace("$body", text)
			var win = window.open('',Ext.util.Format.stripTags(this.title),'height=400,width=400')
			win.document.write(html)
			win.document.close()
			// $(win).ready(function() {
			// 	win.document.body.innerHTML = text
			// 	if (win.focus) win.focus()
			// })
		})
	},
	toSVG: function (btn) {
		this.svgWindow = Ext.create('App.ui.SVGEditorWindow',{
			// stylesUrl: 'styles/strand-preview.css',
			title: 'SVG',
		});
		this.svgWindow.show()
		this.svgWindow.setValue(this.workspace.getCanvasMarkup())
	},
});