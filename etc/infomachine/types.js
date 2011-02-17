new InfoMachine.Type({
	name: 'item',
	properties: [{
		iconClass: { type: 'text' }	
	}]
});


new InfoMachine.Type({
	name: 'noun',
	isPrimitive: false,
	extends: 'item'
});


new InfoMachine.Type({
	name: 'text',
	isPrimitive: true,
	accepts: Ext.isString
});

new InfoMachine.Type({
	name: 'bool',
	isPrimitive: true,
	accepts: Ext.isBool
});

new InfoMachine.Type({
	name: 'number',
	isPrimitive: true,
	accepts: Ext.isNumber
});

new InfoMachine.Type({
	name: 'date',
	isPrimitive: true,
	accepts: Ext.isDate
});

new InfoMachine.Type({
	name: 'color',
	isPrimitive: true,
	extends: 'text'
});

new InfoMachine.Type({
	name: 'list'
});