/**
 * Allows running of Karthik Sarma's domain-level reaction enumerator.
 */
Ext.define('App.usr.enum.RunButton', {
	extend: 'Ext.button.Split',
	text: 'Run Enumerator',
	iconCls: 'enum-icon',
	initComponent: function() {
		
		
		this.condense = Ext.create('Ext.menu.CheckItem', {
			text: 'Condense output',
			name: 'condense',
			checked: false,
		});
		this.maxComplexSize = Ext.create('Ext.form.field.Number',{
			minValue: 1,
			value: 10,
			indent: true,
		});
		this.releaseCutoff = Ext.create('Ext.form.field.Number',{
			minValue: 1,
			value: 8,
			indent: true,
		});
		this.maxComplexCount = Ext.create('Ext.form.field.Number',{
			minValue: 1,
			value: 200,
			indent: true,
		});
		this.maxReactionCount = Ext.create('Ext.form.field.Number',{
			minValue: 1,
			value: 1000,
			indent: true,
		});

		
		Ext.apply(this,{
			handler: this.makeEnumHandler('enjs'),
			scope: this,

			menu: [{
				text: 'ENJS',
				handler: this.makeEnumHandler('enjs'),
				iconCls: 'enum-icon',
				scope: this,
			},{
				text: 'PIL',
				handler: this.makeEnumHandler('pil'),
				iconCls: 'pil',
				scope: this,
			},{
				text: 'CRN',
				handler: this.makeEnumHandler('crn'),
				iconCls: 'crn',
				scope: this,
			},{
				text: 'SBML',
				handler: this.makeEnumHandler('sbml'),
				iconCls: 'sbml',
				scope: this,
			},'-',{
				text: 'Legacy',
				handler: this.makeEnumHandler('legacy'),
				iconCls: 'gear',
				scope: this,
			},{
				text: 'Graph (EPS)',
				handler: this.makeEnumHandler('graph'),
				scope: this,
			},'-',this.condense,{ 
				text: 'Maximum complex size (stands): ',
				canActivate: false,
			},this.maxComplexSize,{ 
				text: 'Release cutoff (nt): ',
				canActivate: false,
			},this.releaseCutoff,{ 
				text: 'Maximum complexes to enumerate: ',
				canActivate: false,
			},this.maxComplexCount,{ 
				text: 'Maximum reaction to enumerate: ',
				canActivate: false,
			},this.maxReactionCount]
		});
		
		this.callParent(arguments);
	},
	makeEnumHandler: function(mode) {
		return function() {
			this.runEnum(mode);
		}
	},
	runEnum: function(mode) {
		var node = this.app.doc.getDocumentPath(),
			resNode = App.path.addExt(App.path.removeExt(node,'enum')+'-enum',mode);

		App.runTask('Enumerator', {
			node: this.app.getDocumentPath(),
			mode: mode,
			condense: this.condense.checked,
			'max-complex-size': this.maxComplexSize.getValue(),
			'release-cutoff': this.releaseCutoff.getValue(),
			'max-complex-count': this.maxComplexCount.getValue(),
			'max-reaction-count': this.maxReactionCount.getValue(),

		},function(success) {
			if(success) 
				Ext.msg('Enumerator','Reaction enumeration completed.');
			else
				Ext.msg('Enumerator','Reaction enumeration failed. Click for details.',{handler: 'console'});

		},this,{
			openOnEnd: [resNode]
		});
		Ext.msg('Enumerator','Reaction enumeration started.');
	},
})