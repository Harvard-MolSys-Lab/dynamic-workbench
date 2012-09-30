/**
 * Allows editing of Systems Biology Markup Language documents
 */
Ext.define('App.ui.SBMLEditor', {
	extend: 'App.ui.TextEditor',
	iconCls:'document-sbml',
	editorType: 'SBML',
	title: 'SBML',
	mode: 'xml',
	alias: 'widget.sbmledit',
	
	
	dockedItems: [{
		xtype: 'cite',
		cite: 'sbml_2003'
	}],
	url: 'http://sbml.org/validator/',
	initComponent: function() {
		
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = [{
			text: 'Validate SBML',
			href: this.url,
			// handler: this.validateSBML,
			// scope: this,
			iconCls: 'tick',
		},'->',{
			text: 'SBML Reference',
			iconCls: 'help',
			href: 'http://sbml.org/Basic_Introduction_to_SBML',
		},Ext.create('App.ui.SaveButton',{
			app: this,
		})];
		Ext.apply(this, {
			tbar: tbar
		})
		
		this.form = Ext.create('Ext.form.Basic', this, {});
		
		this.callParent(arguments);
	},
	validateSBML: function() {
		this.form.doAction('standardsubmit',{
			params: this.getParams(),
			target: '_blank',
			url: this.url,
			clientValidation: false,
			method: 'post',
			enctype:'multipart/form-data',
		})
	},
	getParams: function() {
		return {
			'file':this.getValue(),
			'output':'XHTML',
		}
	},
})