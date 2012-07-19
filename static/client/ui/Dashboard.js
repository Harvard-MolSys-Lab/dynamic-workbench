/**
 * Displays a dashboard allowing common actions to be performed when the IDE opens.
 */
Ext.define('App.ui.Dashboard', {
	extend: 'Ext.panel.Panel',
	requires: ['App.ui.Attribution'],
	overflowY: 'auto',
	initComponent: function() {

		Ext.apply(this, {
			title: 'Dashboard',
			bodyStyle:'padding:10px',
			iconCls: 'dash',
			autoLoad: {
				url: 'html/dashboard.html',
				callback: this.initDashboard,
				scope: this
			}
		});

		App.on('userNameChanged', function(name,email) {
			var un = Ext.get('fp-user-name');
			if(un) un.update(App.User.name+' ('+App.User.email+')');
		});
		this.callParent();
	},
	/**
	 * Perform custom personization actions upon initialization of the dashboard. 
	 */
	initDashboard: function() {
		if(App.User.isLoggedIn()) {
			var un = Ext.get('fp-user-name');
			if(un) un.update(App.User.name+' ('+App.User.email+')');
			
			if(App.User.isGuest()) {
				var guest_banner = Ext.get('guest-user-welcome');
				if(guest_banner) {
					guest_banner.show()
				}
			}
		}
			Ext.get('fp-citations').update(App.ui.Attribution.printAllCitations())
		var quickstart = Ext.create('Ext.panel.Panel',{
			renderTo: Ext.get('dashboard-quickstart'),
			width: 260,
			height: 270,
			baseCls:'x-plain',
			layout: {
	            type: 'table',
	            columns: 3
	        },
	        defaults: {xtype: 'button', scale: 'medium', iconAlign: 'top', width: 70, height: 50},
	        items: [
	        	// Row 0.5
		        {
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 15,
		        	html: '<h3>Design</h3>'
		        },{
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 15,
		        	html: '<h3>Testing</h3>',
		        	colspan: 2,
		        	width: 165,
		        	style: 'text-align: center',
		        },
	        
	        
	        	// Row 1
		        {
		        	text: 'Behaviors',
		        	iconCls: 'behavior-24',
		        	menu: [{
		        		text: 'Nodal',
		        		iconCls: 'nodal',
		        		handler: App.ui.Launcher.makeLauncher('nodal'),
		        	},{
		        		text: 'Pepper',
		        		iconCls: 'pepper',
		        		handler: App.ui.Launcher.makeLauncher('pepper'),
		        	},{
		        		text: 'Chemical Reaction Network (CRN)',
		        		iconCls: 'crn',
		        		disabled: true,
		        		handler: App.ui.Launcher.makeLauncher('crn'),
		        	}]
		        },{
		        	text: 'Enumerate',
		        	iconCls: 'enumerate-24',
		        	disabled: true,
		        },{
		        	text: 'Verify',
		        	iconCls: 'verify-24',
		        	disabled: true,
		        },	
		        
		        // Row 1.5
		        {
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        	cls:'overflowing',
		        	cellCls: 'overflowing-top',
		        	layout: {
				        type: 'hbox',
				        align: 'middle'
				    },
		        	items: [{
		        		xtype: 'label',
		        		html: '&nbsp;&nbsp;&nbsp;&darr;&nbsp;&nbsp;&nbsp;',
		        	},{
		        		xtype: 'button',
		        		iconCls: 'domains',
		        		text: 'Domain Design',
		        	}]
		        },{
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        },{
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        },
		        
		        
	        	// Row 2
		        {
		        	text: 'Domains',
		        	iconCls: 'domains-24',
		        	menu: [{
		        		text: 'Strand editor',
		        		handler: App.ui.Launcher.makeLauncher('strandedit'),
		        		iconCls: 'domains',
		        	},{
		        		text: 'Pepper Intermediate Language (PIL)',
		        		handler: App.ui.Launcher.makeLauncher('pepper'),
		        		iconCls: 'pil',
		        	},{
		        		text: 'Secondary Structure design',
		        		iconCls: 'secondary',
		        	}]
		        },{
		        	text: 'Enumerate',
		        	iconCls: 'enumerate-24',
		        	handler: App.ui.Launcher.makeLauncher('enumedit'),
		        },{
		        	text: 'Simulate',
		        	iconCls: 'simulate-24',
		        	menu: [{
		        		text: 'SBML',
		        		iconCls: 'sbml',
		        		handler: App.ui.Launcher.makeLauncher('sbml'),
		        	}]
		        },
		        
		        // Row 2.5
		        {
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        	cls:'overflowing',
		        	cellCls: 'overflowing-top',
		        	layout: {
				        type: 'hbox',
				        align: 'middle'
				    },
		        	items: [{
		        		xtype: 'label',
		        		html: '&nbsp;&nbsp;&nbsp;&darr;&nbsp;&nbsp;&nbsp;',
		        	},{
		        		xtype: 'button',
		        		text: 'Sequence Design',
		        		iconCls: 'sequence',
		        		menu: [{
		        			text: 'Web DD',
		        			iconCls: 'dd',
		        			handler: App.ui.Launcher.makeLauncher('dd')
		        		}, {
		        			text: 'NUPACK Multi-objective designer',
		        			iconCls: 'nupack-icon',
		        			handler: function() {
								var win = Ext.create('App.ui.nupack.DesignWindow');
								win.show();
							}
		        		},{
		        			text: 'Multisubjective',
		        			iconCls: 'ms-icon',
		        			handler: App.ui.Launcher.makeLauncher('msedit')
		        		},{
		        			text: 'Spurious C',
		        			iconCls: 'spuriousC spurious',
		        			disabled: true,
		        		}]
		        	}]
		        },{
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        },{
		        	xtype: 'panel',
		        	baseCls: 'x-plain',
		        	height: 30,
		        },
		        
		        
	        	// Row 3
	        	{
		        	text: 'Sequences',
		        	iconCls: 'sequence-24',
		        	menu: [{
		        		text: 'Sequence editor',
		        		iconCls: 'sequence',
		        	},{
						text : 'NUPACK',
						iconCls : 'nupack-icon',
						handler : App.ui.Launcher.makeLauncher('nupack'),
						menu : Ext.create('App.ui.NupackMenu'),
					}, {
						text: 'Mfold',
						iconCls: 'mfold-icon',
						menu: [{
							text: 'QuikFold',
							iconCls: 'mfold-icon',
							handler: function() {
								var win = Ext.create('App.ui.mfold.QuikFoldWindow');
								win.show();
							}
						}]
					},{
						text: 'Vienna RNA',
						iconCls: 'tbi',
						menu: [{
							text: 'RNAfold Server',
							iconCls: 'tbi',
							handler: function() {
								var win = Ext.create('App.ui.vienna.RNAfoldWindow');
								win.show();
							}
						}]
					}]
		        },{
		        	text: 'Simulate',
		        	iconCls: 'simulate-24',
		        	colspan: 2,
		        	width: 165,
		        	disabled: true,
		        	
		        },
	        ]

		})
	}
});