
InfoMachine.createType({
	name: 'object',
	iconCls: 'infoMachine_object',
	match: function() { return true; },
	editorConfig: { xtype: 'objecteditor' }
},{});

InfoMachine.createType({
	name: 'type',
	iconCls: 'infoMachine_type',
	match: InfoMachine.hasType,
	editorConfig: { xtype: 'textfield' }
},{});

InfoMachine.createType({
	name: 'string',
	iconCls: 'infoMachine_string',
	match: Ext.isString,
	editorConfig: { xtype: 'textfield' }
},{});

InfoMachine.createType({
	name: 'number',
	iconCls: 'infoMachine_number',
	match: Ext.isNumber,
	editorConfig: { xtype: 'numberfield' }
},{});

InfoMachine.createType({
	name: 'color',
	iconCls: 'infoMachine_color',
	editorConfig: { xtype: 'colorfield' },
	match: function(item) {
		return (color.fromObject(item));
	}
},{});


InfoMachine.createType({
	name: 'rect',
	iconCls: 'rect'
},{
	x: {type: 'number', location: 'getX' },
	y: {type: 'number', location: 'getY' },
	'fill': {type: 'color', location: 'fill' },	
	'stroke': {type: 'color', location: 'stroke' },
	'strokeWidth': {type: 'number', location: 'strokeWidth' },
	'opacity': {type: 'number', location: 'opacity' }	
});