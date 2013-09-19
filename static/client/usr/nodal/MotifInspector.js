/**
 * Allows editing DyNAML for a custom motif
 */
Ext.define('App.usr.nodal.MotifInspector', {
	requires : ['App.ui.CodeMirror','App.usr.nodal.MotifEditor'],
	extend : 'Ext.form.Panel',
	mixins : {
		boundObjectPanel : 'App.ui.BoundObjectPanel',
		tip: 'App.ui.TipHelper'
	},
	title : 'Motif',
	bodyPadding : 5,
	enableBoundFields : true,
	initComponent : function() {
		var me = this;

		Ext.apply(this, {
			defaults : {
				xtype : 'textfield',
			},
			fieldDefaults : {
				labelWidth : 100,
			},
			items : [{
				objectBinding : 'name',
				anchor : "100%",
			}, {
				xtype : 'sliderfield',
				fieldLabel : 'Rotation',
				minValue : 0,
				maxValue : 360,
				width : 100,
				increment : 15,
				anchor : '95%',
				objectBinding : 'theta',
				tipText : function(thumb) {
					return String(thumb.value) + '°';
				}
			}, {
				xtype: 'fieldset',
				layout: 'anchor',
				title: 'Motif Definition',
				items: [{
					xtype:'button',
					text: 'Edit Motif',
					iconCls: 'edit',
					handler: this.showMotifEditor,
					scope: this,
					margin: '0 3 3 0',
					tooltip: 'Edit this motif using the graphical motif editor.'
				},{
					xtype:'button',
					text:'Copy from Built-in',
					iconCls: 'duplicate',
					tooltip: 'Update the definition of this motif to duplicate one of the built-in motifs. '+
						'You can then use the graphical Motif Editor (left) or directly edit the DyNAML code (below) to make changes to this new motif.',
					margin: '0 3 3 0',
					menu: _.map(App.dynamic.Compiler.standardMotifs,function (mot) {
						return (function(motif) { 
							return {
								text: motif.name,
								handler: function() {
									me.codeEditor.setValue(JSON.stringify(motif,null,"\t"));
								}
							};
						})(mot);
					}),
				},{
					xtype: 'codemirror',
					objectBinding: 'dynaml',
					objectBindingEvent: 'blur',
					anchor: '100%',
					height: 300,
					title: 'DyNAML Code',
					collapsed: true,
					collapsible: true,
					resizable: true,
					cls: 'simple-header',
					mode: {
						name: 'javascript',
						json: true,
					}
				}]

			}],
			showIf : function(wtype) {
				return (wtype == 'App.usr.nodal.ws.objects.Motif');
			},
		})
		this.callParent(arguments);
		this.mixins.boundObjectPanel.initialize.apply(this, arguments);
		this.mixins.tip.init.apply(this,arguments);
		this.motifEditors = {};
		this.codeEditor = this.down('[xtype=codemirror]');
	},
	
	showMotifEditor : function() {
		var object = this.getBoundObject();
		if(!this.motifEditors[object.getId()]) {

			var updateMotifDynaml = (function (motifObject) {
				return function() {
					var panel = this.motifEditors[motifObject.getId()];
					motifObject.set('dynaml',panel.getValue());
				};
			})(object);

			var data = object.get('dynaml'), parsedData;
			try {
				parsedData = JSON.parse(data || '{}');
				parsedData.name = parsedData.name || object.get('name');
				data = JSON.stringify(parsedData);
			} catch(e) {
				// TODO: report error
				return;
			}

			this.motifEditors[object.getId()] = Ext.create('App.usr.nodal.MotifEditorWindow',{
				width: 700,
				height: 500,
				closeAction: 'hide',
				title: 'Edit Motif: '+object.get('name'),
				data: data, //object.get('dynaml'),
				buttons: ['->',{
					text: 'Save',
					iconCls: 'tick',
					handler: updateMotifDynaml,
					scope: this,
				}],
			});
			//this.motifEditors[object.getId()].on('close',updateMotifDynaml,this);
		} else {
			this.motifEditors[object.getId()].setValue(object.get('dynaml'))
		}
		this.motifEditors[object.getId()].show();
		
	},
	getBoundObject: function () {
		return this.boundObjects.getAt(0);
	}
})