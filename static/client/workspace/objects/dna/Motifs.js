////////////////////////////////////////////////////////////////////////////////////////////////
Ext.ns('Workspace.objects.dna');

/**
 * @class Workspace.objects.dna.Motifs
 * @singleton
 */
Workspace.objects.dna.Motifs = function() {
	var library = App.dynamic.Library.dummy();
	return _.reduce(_.deepClone(App.dynamic.Compiler.standardMotifs),function(memo, value, key) {
		value.library = library;
		memo[key] = new App.dynamic.Motif(value);
		return memo;
	},{}) 
}();
// {
	// '0': [],
	// '1': ['init',], // initiator (2 segments)
	// '2': ['init',], // initiator (3 segments)
	// '3': ['input','blue'],
	// '4': ['input','green','blue'], //'blue','green'],
	// '5': ['input','pink'],
	// '6': ['input','green','blue','pink',], // TODO FIX ORDER
	// '7': ['input','purple','blue'],
	// '8': ['input','green','purple'],
	// '9': ['input','purple',],
	// '19': ['input','blue'],
// };

/**
 * @class Workspace.objects.dna.Ports
 * @singleton
 */

Workspace.objects.dna.PortClasses = {
	'input' : 'Workspace.objects.dna.InputPort',
	'init' : 'Workspace.objects.dna.OutputPort',
	'output' : 'Workspace.objects.dna.OutputPort',
	'bridge' : 'Workspace.objects.dna.BridgePort',
}

Workspace.objects.dna.Ports = {
	'input': {
		wtype: 'Workspace.objects.dna.InputPort',
		stroke: 'orange',
	},
	'init': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#553300'
	},
	'green': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#66ff33'
	},
	'blue': {
		wtype: 'Workspace.objects.dna.OutputPort',
		stroke:'#33ccff'
	},
	'pink': {
		wtype: 'Workspace.objects.dna.BridgePort',
		stroke:'#ff1177'
	},
	'purple': {
		wtype: 'Workspace.objects.dna.BridgePort',
		stroke:'#9900cc'
	},
};

// TODO: just grab built-in motifs from App.dynamic.Compiler#standardMotifs
// Workspace.objects.dna.Motifs = function(motifs) {
	// var newMotifs = {};
	// _.each(motifs,function(spec,name) {
		// if(_.isArray(spec)) {
			// newMotifs[name] = _.map(spec,function(port) {
				// if(_.isString(port)) {
					// return Workspace.objects.dna.Ports[port];
				// }
			// });
		// } else {
			// newMotifs[name] = spec;
		// }
	// });
	// return newMotifs;
// }(Workspace.objects.dna.Motifs);

Workspace.objects.dna.motifStore = (function() {
	var data = [], i=0;
	for(var m in Workspace.objects.dna.Motifs) {
		data[i] = {
			number: m, //parseInt(m),
			spec: Workspace.objects.dna.Motifs[m]
		};
		i++;
	}
	Ext.define('Motif', {
		extend: 'Ext.data.Model',
		fields: [{
			name: 'number',
			type: 'string'
		},{
			name: 'spec',
			type: 'auto'
		}
		]
	});
	return Ext.create('Ext.data.Store', {
		data: data,
		model: 'Motif',
	});
})();
