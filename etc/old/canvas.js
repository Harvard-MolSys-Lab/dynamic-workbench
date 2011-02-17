Ext.BLANK_IMAGE_URL = '/scripts/ext-3.0.0/resources/images/default/s.gif';
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'side';
	
	// Remove the loading panel after the page is loaded
	Ext.get('loading').remove();
	Ext.get('loading_mask').fadeOut({remove:true});
	
	
	var viewport = new Ext.Viewport({
		layout: 'fit',
		items: [new Ext.ux.LiveCanvas()]	
		
	});
});



Ext.ux.LiveCanvas = Ext.extend(Ext.Panel, {
	initComponent: function() {
		
		var canvas = this;
		
		Ext.apply(this,{
			tbar:[{
				xtype:'buttongroup',
				title:'Tools',
				columns:2,
				items:[{
					iconCls: 'cursor',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('pointer');
					},
					pressed: true
				},{
					iconCls: 'pencil',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('pencil');
					}

				},{
					iconCls: 'paintbrush',
					toggleGroup: 'toolbox',
					enableToggle: true

				},{
					iconCls: 'vector',
					toggleGroup: 'toolbox',
					enableToggle: true

				}]	
			},{
				xtype:'buttongroup',
				title:'Fill',
				columns: 1,
				items:[new Ext.ux.ColorField({
					fieldLabel:'Fill Color'
				}), {
					xtype: 'slider',
				}]	

			},{
				xtype:'buttongroup',
				title:'Stroke',
				columns: 1,
				items:[new Ext.ux.ColorField({
					anchor:'right'
				}),{
					xtype: 'slider',
					anchor:'right'
				}]	

			},{
				xtype:'buttongroup',
				title:'Insert',
				columns: 3,
				items:[{
					iconCls: 'line',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('line');
					}
				},{
					iconCls: 'rect',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('rect');
					}
				},{
					iconCls: 'ellipse',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('ellipse');
					}
				},{
					iconCls: 'polygon',
					toggleGroup: 'toolbox',
					enableToggle: true

				},{
					iconCls: 'path',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toggleHandler: function(btn,pressed) {
						if(pressed) canvas.workspace.setActiveTool('polyline');
					}
				},{
					iconCls: 'curve',
					toggleGroup: 'toolbox',
					enableToggle: true

				}]	
			},{
				xtype:'buttongroup',
				title:'Transform',
				columns: 4,
				items:[{
					iconCls: 'rotate-left'
				},{
					iconCls: 'rotate-right'
				},{
					iconCls: 'flip-horiz'
				},{
					iconCls: 'flip-vert'
				},{
					iconCls: 'arrange-forward'
				},{
					iconCls: 'arrange-backwards'
				},{
					iconCls: 'arrange-front'
				},{
					iconCls: 'arrange-back'
				}]	
			}]
		});
		
		this.on('render',function() {
			//Ext.ux.LiveCanvas.superclass.render.call(this);		
			
			this.workspace = new Workspace(this.body,{
				tools: ['pointer','pencil','paintbrush','vector','rect','ellipse','line','polyline']	
			});
			
			App.defaultWorkspace = this.workspace;
		})
		
		this.on('resize',function(c,w,h) {
			this.workspace.paper.setSize(w,h);
		});
		
		Ext.ux.LiveCanvas.superclass.initComponent.call(this);
	}
});



Ext.ux.Inspector = Ext.extend(Ext.Window, {
	initComponent: function() {
		if(this.item) {
			var items = [];
			var t = this.item.getType();
			if(t) {
				items.push(Ext.apply({
					item: this.item
				},t.editorConfig));
				Ext.apply(this,{
					layout: 'fit',
					autoShow: true,
					renderTo: document.body,
					width: 280,
					height: 200,
					minHeight: 200,
					plain: true,
					border: false,
					items: items
				});	
			}
		}
		this.on('afterrender',this.position,this);
		Ext.ux.Inspector.superclass.initComponent.call(this);
	},
	position: function() {
		
		if(this.item) {
			var pos = this.item.getAbsolutePosition();
			this.setPagePosition(parseInt(pos.x+this.item.getWidth()+20),parseInt(pos.y-10));
		}	
	}
});


Ext.ux.InfoMachineObjectEditor = Ext.extend(Ext.FormPanel, {
	initComponent: function() {
		if(this.item) {
			var items = [];
			/*
			var groups = {};
			if(this.groups) {
				for(var groupName in this.groups) {
					var group = this.groups[groupName];
					var fieldSet = { xtype: 'fieldset', items: [] }
				}	
			}
			*/
			
			this.item.eachField(function(fieldName,field) {
				var t = InfoMachine.getType(field.type);
				var editorConfig = Ext.apply({
					item: this.item,
					fieldBinding: fieldName,
					listeners: {
						'change': function(field, newValue, oldValue) {
							if(field.item && field.isValid()) {
								field.item.set(field.fieldBinding, newValue);
							}	
						}	
					}
				},t.editorConfig);
				
				editorConfig.fieldLabel = field.canonical || '';
				items.push(editorConfig);
			},this);
			
			
			
			Ext.apply(this,{
				frame: 'false',
				border: 'false',					
				autoScroll: true,
				items: items
			});	
		}
		Ext.ux.InfoMachineObjectEditor.superclass.initComponent.call(this);
	},
	
});


Ext.reg('objecteditor',Ext.ux.InfoMachineObjectEditor);
