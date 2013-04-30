////////////////////////////////////////////////////////////////////////////////////////////////
Ext.ns('App.usr.nodal.ws.objects');

/**
 * @class App.usr.nodal.ws.objects.Motifs
 * @singleton
 */
App.usr.nodal.ws.objects.Motifs = function() {
	var library = App.dynamic.Library.dummy();
	return _.reduce(_.deepClone(App.dynamic.Compiler.standardMotifs),function(memo, value, key) {
		value.library = library;
		memo[key] = new App.dynamic.Motif(value);
		return memo;
	},{}) 
}();
/**
 * @class App.usr.nodal.ws.objects.MotifLibraries
 * @singleton
 *
 * This class is actually an array of objects similar to App.usr.nodal.ws.objects.Motifs. Each object
 * maps motif names to App.dynamic.Motif objects. These mappings are used by 
 * App.usr.nodal.ws.objects.MotifStore#loadFromHash to add Motif objects to the {@link App.usr.nodal.ws.objects.MotifStore motif stores}.
 *
 * Elements of this array correspond to {@link App.dynamic.Compiler#standardMotifsVersions versions of the standard motifs library}.
 */
App.usr.nodal.ws.objects.MotifLibraries = (function () {
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
 * @class App.usr.nodal.ws.objects.Ports
 * @singleton
 */

App.usr.nodal.ws.objects.PortClasses = {
	'input' : 'App.usr.nodal.ws.objects.InputPort',
	'init' : 'App.usr.nodal.ws.objects.OutputPort',
	'output' : 'App.usr.nodal.ws.objects.OutputPort',
	'bridge' : 'App.usr.nodal.ws.objects.BridgePort',
}

App.usr.nodal.ws.objects.Ports = {
	'input': {
		wtype: 'App.usr.nodal.ws.objects.InputPort',
		stroke: 'orange',
	},
	'init': {
		wtype: 'App.usr.nodal.ws.objects.OutputPort',
		stroke:'#553300'
	},
	'green': {
		wtype: 'App.usr.nodal.ws.objects.OutputPort',
		stroke:'#66ff33'
	},
	'blue': {
		wtype: 'App.usr.nodal.ws.objects.OutputPort',
		stroke:'#33ccff'
	},
	'pink': {
		wtype: 'App.usr.nodal.ws.objects.BridgePort',
		stroke:'#ff1177'
	},
	'purple': {
		wtype: 'App.usr.nodal.ws.objects.BridgePort',
		stroke:'#9900cc'
	},
};

// TODO: just grab built-in motifs from App.dynamic.Compiler#standardMotifs
// App.usr.nodal.ws.objects.Motifs = function(motifs) {
	// var newMotifs = {};
	// _.each(motifs,function(spec,name) {
		// if(_.isArray(spec)) {
			// newMotifs[name] = _.map(spec,function(port) {
				// if(_.isString(port)) {
					// return App.usr.nodal.ws.objects.Ports[port];
				// }
			// });
		// } else {
			// newMotifs[name] = spec;
		// }
	// });
	// return newMotifs;
// }(App.usr.nodal.ws.objects.Motifs);

App.usr.nodal.ws.objects.motifStore = (function() {
	var data = [], i=0;
	for(var m in App.usr.nodal.ws.objects.Motifs) {
		data[i] = {
			number: m, //parseInt(m),
			spec: App.usr.nodal.ws.objects.Motifs[m]
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


Ext.define('App.usr.nodal.ws.objects.MotifStore',{
	extend: 'Ext.data.Store',
	model : App.usr.nodal.ws.objects.motifStore.model,
	/**
	 * Loads records from an object containing a name:motif mapping, like this:
	 *
	 *     {
	 *     	'm0': new App.dynamic.Motif({ name: 'm0', ... }),
	 *     	'm1': new App.dynamic.Motif({ name: 'm1', ... }),
	 *     	... 
	 *     }
	 *
	 * App.usr.nodal.ws.objects.MotifLibraries is an array of such mappings (for all versions of the standard motif library).
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
