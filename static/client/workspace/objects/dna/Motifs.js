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
/**
 * @class Workspace.objects.dna.OldMotifs
 * @singleton
 *
 * This class is actually an array of objects similar to Workspace.objects.dna.Motifs. Each object
 * maps motif names to App.dynamic.Motif objects. These mappings are used by 
 * Workspace.objects.dna.MotifStore#loadFromHash to add Motif objects to the {@link Workspace.objects.dna.MotifStore motif stores}.
 *
 * Elements of this array correspond to {@link App.dynamic.Compiler#standardMotifsVersions versions of the standard motifs library}.
 */
Workspace.objects.dna.OldMotifs = (function () {
	var out = [];
	for(var i = 0, l = App.dynamic.Compiler.standardMotifsVersions.length; i<l; i++) {
		var library = App.dynamic.Library.dummy();
		out.push(_.reduce(_.deepClone(App.dynamic.Compiler.standardMotifsVersions[i]),function(memo, value, key) {
			value.library = library;
			memo[key] = new App.dynamic.Motif(value);
			return memo;
		},{}));
	}
	return out;
})()

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


Ext.define('Workspace.objects.dna.MotifStore',{
	extend: 'Ext.data.Store',
	model : Workspace.objects.dna.motifStore.model,
	/**
	 * Loads records from an object containing a name:motif mapping, like this:
	 *
	 *     {
	 *     	'm0': new App.dynamic.Motif({ name: 'm0', ... }),
	 *     	'm1': new App.dynamic.Motif({ name: 'm1', ... }),
	 *     	... 
	 *     }
	 *
	 * Workspace.objects.dna.OldMotifs is an array of such mappings (for all versions of the standard motif library).
	 * 
	 * @param  {Object} hash An object mapping motif names to {@link App.dynamic.Motif objects}
	 */
	loadFromHash: function (hash) {
		var data = [];
		for(var m in hash) {
			data.push({
				number: m, //parseInt(m),
				spec: hash[m]
			});
		}
		this.add(data);
	}
});
