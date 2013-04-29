Ext.define('App.ui.StructureEditor',{
	extend: 'Ext.panel.Panel',
	mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    initComponent: function () {
    	this.callParent(arguments);
    	this.initLabelable();
    	this.initField();
    },
    getValue: function () {
    	
    },
    setValue: function (value) {

    },
});

function StructureEditor() {
	
}