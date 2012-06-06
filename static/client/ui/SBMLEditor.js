/**
 * Allows editing of Systems Biology Markup Language documents
 */
Ext.define('App.ui.SBMLEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'document-sbml',
	editorType: 'SBML',
	mode: 'xml',
	alias: 'widget.sbmledit',
	
	
	dockedItems: [{
		xtype: 'cite',
		cite: 'sbml_2003'
	}],

	
	initComponent: function() {
		this.mode = {
				name: 'nupack',
				multisubjective: true,
			}
		
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = this.extraTbarItems;
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
})