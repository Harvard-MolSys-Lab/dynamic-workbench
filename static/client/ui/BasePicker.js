Ext.define('App.ui.BasePicker',{
	alias: 'widget.basepicker',
	extend: 'Ext.ux.form.field.BoxSelect',
	displayField: 'base',
	valueField: 'value',
	multiSelect: true,
	queryMode: 'local',
	constructor:function() {
		this.store = Ext.create('Ext.data.Store',{
			fields: [
           {name: 'base', type: 'string'},
           {name: 'value', type: 'int'},
        ],
        data:[
     		{base:'G',value:8},
        	{base:'A',value:4},
     		{base:'T',value:2},
     		{base:'C',value:1},   
        ]});
		this.callParent(arguments);
	},
	getAggregate: function() {
		var v = this.getValue();
		//v = v.split(this.delimiter);
		return _.reduce(v, function(memo, num){ return memo + parseInt(num); }, 0);
	},
	setAggregate: function(v) {
		v = parseInt(v);
		var x = [
			 (v & 8), (v & 4), (v & 2), (v & 1) , 
		];
		x = _.compact(x);
		this.setValue(x);
		
	}
})
