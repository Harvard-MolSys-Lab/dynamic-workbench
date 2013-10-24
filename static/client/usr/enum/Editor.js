/**
 * Allows editing of scripts for Karthik Sarma's domain-level reaction enumerator.
 */
Ext.define('App.usr.enum.Editor', {
	extend: 'App.usr.text.Editor',
	iconCls:'enum-icon',
	editorType: 'Enum',
	title: 'Enumerator',
	mode: 'pepper',
	alias: 'widget.enumedit',
	/**
	 * @cfg
	 * True to show the edit button
	 */
	showEditButton:true,
	/**
	 * @cfg
	 * True to show the save button
	 */
	showSaveButton:true,
	
	dockedItems: [{
		xtype: 'cite',
		cite: {
			authors: ['Karthik Sarma', 'Brian Wolfe', 'Erik Winfree'],
			title: 'Domain-based reaction enumeration',
			publication: 'Unpublished'
		},
	}],
	
	/**
	 * @cfg
	 * Enable additional multisubjective syntax
	 */
	multisubjective: false,
	
	initComponent: function() {
		
		this.extraTbarItems = [];
		
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
		
		var tbar = this.extraTbarItems.concat([{
			text: 'Run Enumerator',
			iconCls: 'enum-icon',
			handler: this.makeEnumHandler('enjs'),
			scope: this,
			xtype: 'splitbutton',
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
				text: 'Legacy',
				handler: this.makeEnumHandler('legacy'),
				iconCls: 'gear',
				scope: this,
			},{
				text: 'SBML',
				handler: this.makeEnumHandler('sbml'),
				iconCls: 'sbml',
				scope: this,
			},{
				text: 'Graph (EPS)',
				handler: this.makeEnumHandler('graph'),
				scope: this,
			},'-',this.condense,{ 
				text: 'Maximum complex size: ',
				canActivate: false,
			},this.maxComplexSize]
		}]);
		
		if(this.showEditButton) {
			tbar.push({
				text: 'Edit',
				iconCls: 'pencil',
				/**
				 * @property {Ext.button.Button} editButton
				 * Shows a small edit menu
				 */
				ref: 'editButton',
				menu: [{
					text: 'Thread segments to sequences',
					handler: this.threadStrands
				},]
			})
		}
		if(this.showSaveButton) {
			tbar = tbar.concat(['->',Ext.create('App.ui.SaveButton',{
				app: this,
			})]);
		}
		Ext.apply(this, {
			tbar: tbar
		})
		this.callParent(arguments);
	},
	makeEnumHandler: function(mode) {
		return function() {
			this.runEnum(mode);
		}
	},
	runEnum: function(mode) {
		var node = this.doc.getDocumentPath(),
			resNode = App.path.addExt(App.path.removeExt(node,'enum')+'-enum',mode);

		App.runTask('Enumerator', {
			node: this.getDocumentPath(),
			mode: mode,
			condense: this.condense.checked,
			'max-complex-size': this.maxComplexSize.getValue(),
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
	/**
	 * Opens a {@link App.ui.SequenceThreader sequence threader}, allowing the 
	 * user to thread together sequences based on a sequence specification into
	 * full strands.
	 */
	threadStrands: function() {
		var win = Ext.create('App.ui.SequenceThreader');
		win.show();
		win.setStrands(this.getSelection());
	},
})