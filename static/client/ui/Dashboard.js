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
	toggleAboutText: function () {
		Ext.get('workbench-about').setVisibilityMode(Ext.dom.Element.DISPLAY).toggle();
		var t = Ext.get('workbench-about-trigger');
		if(t.getHTML() == 'More') {
			t.setHTML('Less')
		} else {
			t.setHTML('More')
		}
	},
	toggleBiblio: function () {
		Ext.get('fp-citations').setVisibilityMode(Ext.dom.Element.DISPLAY).toggle();
		var t = Ext.get('workbench-citations-trigger');
		if(t.getHTML() == 'Show') {
			t.setHTML('Hide')
		} else {
			t.setHTML('Show')
		}
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
		Ext.get('workbench-about-trigger').on('click',this.toggleAboutText,this)
		Ext.get('workbench-citations-trigger').on('click',this.toggleBiblio,this)

		var quickstart = Ext.create('Ext.panel.Panel',{
			renderTo: Ext.get('dashboard-quickstart'),
			// width: 500,
			// height: 270,
			baseCls:'x-plain',
			layout: {
				type: 'table',
				columns: 6
			},
			defaults: {
				xtype: 'button', scale: 'medium', iconAlign: 'top', 
				// width: 130, 
				// height: 50
			},
			items: [
				// Row 0
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 15,
					html: '<h3>Behavioral Tier</h3>'
				},
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 15,
					html: '<h3>Domain Tier</h3>'
				},
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 15,
					html: '<h3>Sequence Tier</h3>'
				},

				

				// Row 1
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 15,
					html: '<h3>Design...</h3>'
				}, {
					text: 'Behavioral Systems',
					iconCls: 'behavior-24',
					width: 130,
					menu: [{
						text: 'Nodal',
						iconCls: 'nodal',
						menu: Ext.create('App.ui.CreateMenu',{
							smartCreate: true,
							defaultType: 'nodal',
							autoCreateMenu: false,
						})
					},{
						text: 'Pepper',
						iconCls: 'pepper',
						handler: App.ui.Launcher.makeLauncher('pepper'),
					},{
						text: 'Chemical Reaction Network (CRN)',
						iconCls: 'crn',
						handler: App.ui.Launcher.makeLauncher('crn'),
					}]
				},{
						width: 30,
						xtype: 'label',
						html: '&nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;',
					
				},{
					text: 'Domain-level Systems',
					width: 130,
					iconCls: 'domains-24',
					menu: [{
						text: 'Domain-level System Editor (DIL)',
						handler: App.ui.Launcher.makeLauncher('strandedit'),
						iconCls: 'domains',
						menu: Ext.create('App.ui.CreateMenu',{
							smartCreate: true,
							defaultType: 'dil',
							autoCreateMenu: false,
						})
					},{
						text: 'Pepper Intermediate Language (PIL)',
						handler: App.ui.Launcher.makeLauncher('pepper'),
						iconCls: 'pil',
					}]
				},{
						width: 30,
						xtype: 'label',
						html: '&nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;',
					
				},{
					text: 'Sequences',
					width: 130,
					iconCls: 'sequence-24',
					menu: [{
						text: 'Sequence editor',
						iconCls: 'sequence',
						handler : App.ui.Launcher.makeLauncher('sequence'),
					},'-',{
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
						menu: Ext.create('App.ui.CreateMenu',{
							smartCreate: true,
							defaultType: 'ms',
							autoCreateMenu: false,
						}),
						// handler: App.ui.Launcher.makeLauncher('msedit')
					},{
						text: 'Spurious C',
						iconCls: 'spuriousC spurious',
						disabled: true,
					}]
				},
				
				// Row 2
				{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 15,
					html: '<h3>Test...</h3>',
					colspan: 1,
					// width: 165,
					style: 'text-align: center',
				},{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},{
					text: 'Enumerate / Simulate',
					width: 130,
					iconCls: 'enumerate-secondary-24',
					disabled: false,
					menu: [{
						text: 'Domain-level Enumerator',
						iconCls: 'enum',
						handler: App.ui.Launcher.makeLauncher('enumedit'), 
					},{
						text: 'SBML',
						iconCls: 'sbml',
						handler: App.ui.Launcher.makeLauncher('sbml'),
					}]
				},{
					xtype: 'panel',
					baseCls: 'x-plain',
					height: 30,
				},{
					text: 'Thermodynamics',
					width: 130,
					iconCls: 'simulate-24',
					menu: [{
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
				},
			]

		})

		// var quickstart = Ext.create('Ext.panel.Panel',{
		// 	renderTo: Ext.get('dashboard-quickstart'),
		// 	width: 260,
		// 	height: 270,
		// 	baseCls:'x-plain',
		// 	layout: {
	 //            type: 'table',
	 //            columns: 3
	 //        },
	 //        defaults: {xtype: 'button', scale: 'medium', iconAlign: 'top', width: 70, height: 50},
	 //        items: [
	 //        	// Row 0.5
		//         {
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 15,
		//         	html: '<h3>Design</h3>'
		//         },{
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 15,
		//         	html: '<h3>Testing</h3>',
		//         	colspan: 2,
		//         	width: 165,
		//         	style: 'text-align: center',
		//         },
			
			
	 //        	// Row 1
		//         {
		//         	text: 'Behaviors',
		//         	iconCls: 'behavior-24',
		//         	menu: [{
		//         		text: 'Nodal',
		//         		iconCls: 'nodal',
		//         		menu: Ext.create('App.ui.CreateMenu',{
		//         			smartCreate: true,
		//         			defaultType: 'nodal',
		//         			autoCreateMenu: false,
		//         		})
		//         	},{
		//         		text: 'Pepper',
		//         		iconCls: 'pepper',
		//         		handler: App.ui.Launcher.makeLauncher('pepper'),
		//         	},{
		//         		text: 'Chemical Reaction Network (CRN)',
		//         		iconCls: 'crn',
		//         		disabled: true,
		//         		handler: App.ui.Launcher.makeLauncher('crn'),
		//         	}]
		//         },{
		//         	text: 'Enumerate',
		//         	iconCls: 'enumerate-24',
		//         	disabled: true,
		//         },{
		//         	text: 'Verify',
		//         	iconCls: 'verify-24',
		//         	disabled: true,
		//         },	
				
		//         // Row 1.5
		//         {
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         	cls:'overflowing',
		//         	cellCls: 'overflowing-top',
		//         	layout: {
		// 		        type: 'hbox',
		// 		        align: 'middle'
		// 		    },
		//         	items: [{
		//         		xtype: 'label',
		//         		html: '&nbsp;&nbsp;&nbsp;&darr;&nbsp;&nbsp;&nbsp;',
		//         	},{
		//         		xtype: 'button',
		//         		iconCls: 'domains',
		//         		text: 'Domain Design',
		//         	}]
		//         },{
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         },{
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         },
				
				
	 //        	// Row 2
		//         {
		//         	text: 'Domains',
		//         	iconCls: 'domains-24',
		//         	menu: [{
		//         		text: 'Strand editor',
		//         		handler: App.ui.Launcher.makeLauncher('strandedit'),
		//         		iconCls: 'domains',
		//         		menu: Ext.create('App.ui.CreateMenu',{
		//         			smartCreate: true,
		//         			defaultType: 'dil',
		//         			autoCreateMenu: false,
		//         		})
		//         	},{
		//         		text: 'Pepper Intermediate Language (PIL)',
		//         		handler: App.ui.Launcher.makeLauncher('pepper'),
		//         		iconCls: 'pil',
		//         	},{
		//         		text: 'Secondary Structure design',
		//         		iconCls: 'secondary',
		//         	}]
		//         },{
		//         	text: 'Enumerate',
		//         	iconCls: 'enumerate-secondary-24',
		//         	handler: App.ui.Launcher.makeLauncher('enumedit'),
		//         	disabled: false,
		//         },{
		//         	text: 'Simulate',
		//         	iconCls: 'simulate-24',
		//         	menu: [{
		//         		text: 'SBML',
		//         		iconCls: 'sbml',
		//         		handler: App.ui.Launcher.makeLauncher('sbml'),
		//         	}]
		//         },
				
		//         // Row 2.5
		//         {
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         	cls:'overflowing',
		//         	cellCls: 'overflowing-top',
		//         	layout: {
		// 		        type: 'hbox',
		// 		        align: 'middle'
		// 		    },
		//         	items: [{
		//         		xtype: 'label',
		//         		html: '&nbsp;&nbsp;&nbsp;&darr;&nbsp;&nbsp;&nbsp;',
		//         	},{
		//         		xtype: 'button',
		//         		text: 'Sequence Design',
		//         		iconCls: 'sequence',
		//         		menu: [{
		//         			text: 'Web DD',
		//         			iconCls: 'dd',
		//         			handler: App.ui.Launcher.makeLauncher('dd')
		//         		}, {
		//         			text: 'NUPACK Multi-objective designer',
		//         			iconCls: 'nupack-icon',
		//         			handler: function() {
		// 						var win = Ext.create('App.ui.nupack.DesignWindow');
		// 						win.show();
		// 					}
		//         		},{
		//         			text: 'Multisubjective',
		//         			iconCls: 'ms-icon',
		//         			menu: Ext.create('App.ui.CreateMenu',{
		// 	        			smartCreate: true,
		// 	        			defaultType: 'ms',
		// 	        			autoCreateMenu: false,
		// 	        		}),
		//         			// handler: App.ui.Launcher.makeLauncher('msedit')
		//         		},{
		//         			text: 'Spurious C',
		//         			iconCls: 'spuriousC spurious',
		//         			disabled: true,
		//         		}]
		//         	}]
		//         },{
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         },{
		//         	xtype: 'panel',
		//         	baseCls: 'x-plain',
		//         	height: 30,
		//         },
				
				
	 //        	// Row 3
	 //        	{
		//         	text: 'Sequences',
		//         	iconCls: 'sequence-24',
		//         	menu: [{
		//         		text: 'Sequence editor',
		//         		iconCls: 'sequence',
		//         		handler : App.ui.Launcher.makeLauncher('sequence'),
		//         	},{
		// 				text : 'NUPACK',
		// 				iconCls : 'nupack-icon',
		// 				handler : App.ui.Launcher.makeLauncher('nupack'),
		// 				menu : Ext.create('App.ui.NupackMenu'),
		// 			}, {
		// 				text: 'Mfold',
		// 				iconCls: 'mfold-icon',
		// 				menu: [{
		// 					text: 'QuikFold',
		// 					iconCls: 'mfold-icon',
		// 					handler: function() {
		// 						var win = Ext.create('App.ui.mfold.QuikFoldWindow');
		// 						win.show();
		// 					}
		// 				}]
		// 			},{
		// 				text: 'Vienna RNA',
		// 				iconCls: 'tbi',
		// 				menu: [{
		// 					text: 'RNAfold Server',
		// 					iconCls: 'tbi',
		// 					handler: function() {
		// 						var win = Ext.create('App.ui.vienna.RNAfoldWindow');
		// 						win.show();
		// 					}
		// 				}]
		// 			}]
		//         },{
		//         	text: 'Simulate',
		//         	iconCls: 'simulate-24',
		//         	colspan: 2,
		//         	width: 165,
		//         	disabled: true,
					
		//         },
	 //        ]

		// })
	}
});