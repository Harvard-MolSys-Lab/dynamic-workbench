/**
 * Provides an interface allowing a set of sequences (e.g. domains/segments) to
 * be "threaded" (connected in order, respecting complementarities) to a set of
 * strands, based on a specification.
 */
Ext.define('App.ui.SequenceThreader', {
	extend : 'Ext.window.Window',
	title: 'Thread Sequences',
	iconCls: 'thread-sequence',
	requires : ['App.ui.SequenceEditor','App.ui.CodeMirror',],
	layout : 'fit',
	minimize : function() {
		this.toggleCollapse();
	},
	minimizable : true,
	maximizable : true,
	width : 400,
	height : 400,
	border: false,
	bodyBorder: false,// '1 0 0 0',
	layout : 'border',
	//margins : 5,
	initComponent : function() {
		Ext.apply(this, {
			//padding: '5 5 5 5',
			tbar : [{
				text : 'Thread',
				iconCls: 'thread-sequence',
				handler : this.thread,
				scope : this,
			},{
				text : 'Normalize',
				iconCls: 'normalize',
				handler : this.normalize,
				scope : this,
			}, {
				text : 'Truncate',
				iconCls: 'cutter',
				handler : this.truncate,
				scope : this,
			},'->',{
				text: 'Show Dethreaded',
				enableToggle: true,
				pressed: false,
				toggleHandler: this.toggleDethreaded,
				name: 'dethreaded',
				scope: this
			}],

			/**
			 * @property {App.ui.CodeMirror} sequencesPane
			 */
			items : [Ext.create('App.ui.CodeMirror',{
				region : 'west',
				width : 200,
				split : true,
				ref : 'sequencesPane',
				mode : 'sequence',
				title : 'Sequence',
				//margins: '5 0 0 5',

				/**
				 * @property {App.ui.CodeMirror} strandsPane
				 */
			}), Ext.create('App.ui.CodeMirror',{
				region : 'center',
				ref : 'strandsPane',
				mode : 'nupack',
				title : 'Strands',
				//margins: '5 5 0 0',
				/**
				 * @property {App.ui.SequenceEditor} resultsPane
				 */
			}), Ext.create('App.ui.SequenceEditor',{
				region : 'south',
				ref : 'resultsPane',
				mode : 'sequence',
				height : 200,
				split : true,
				title : 'Results',
				// margins: '0 5 5 5',
			})],
			buttons : [{
				text : 'Done'
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		}, this);
	},
	/**
	 * inheritdocs App.ui.SequenceEditor#smartSplit
	 */
	smartSelect : function(editor) {
		return App.ui.SequenceEditor.prototype.smartSplit.call(editor, editor.getValue());
	},
	/**
	 * Intelligently selects strands and sequences and threads them to strands
	 * in the #resultsPane
	 */
	thread : function() {
		var seqs = this.smartSelect(this.sequencesPane), strands = this.strandsPane.getValue().split('\n'), strandsMap = {}, namesList;
		// seqs = _.compact(_.map(seqs, function(seq) {
			// return seq.trim();
		// }));
		seqs = _.reduce(seqs,function(memo,seq,i) {
			var parts = seq.split(':');
			if(parts.length == 2 && !!parts[0]) {
				memo[parts[0].trim()] = parts[1].trim()
			} else {
				memo[i+1] = seq;
			}
			return memo;
		},{});
		
		// strandsList = DNA.normalizeSystem(_.compact(_.map(strands, function(strand) {
			// return _.last(strand.split(':')).trim();
		// })));
		
		strandsMap = _.reduce(strands,function(memo,strand,i) {
			var parts = strand.split(':');
			if(parts.length == 2 && !!parts[0]) {
				memo[parts[0].trim()] = parts[1].trim()
			} else {
				memo[i+1] = strand;
			}
			return memo;
		},{});
		
		//seqs.unshift('');
		// _.each(strandsList, function(spec, list, i) {
			// out += (DNA.threadSegments(seqs, spec) + '\n');
		// });
		var out = [], dethreaded = [];
		_.each(strandsMap, function(spec, name, i) {
			var seq = DNA.threadSegments(seqs, spec, false);
			out.push(name + ' : ' + seq.join(''));
			dethreaded.push({ name: name, seq: seq, spec: _.compact(spec.split(' ')) });
		});
		this.dethreaded = _.map(dethreaded,function(block) {
			var spec = block.spec, 
				seq = block.seq, 
				name = block.name;
			
			for(var j = 0; j<spec.length;j++) {
				if(spec[j].length > seq[j].length) {
					seq[j]+=Array(spec[j].length - seq[j].length + 1).join(' ')
				} else if(spec[j].length < seq[j].length) {
					spec[j]+=Array(seq[j].length - spec[j].length + 1).join(' ')
				}
			}
			
			return '>'+name+'|'+spec.join('|')+'\n  '+Array(name.length+1).join(' ')+seq.join('|');
		}).join('\n');
		this.sequences = out.join('\n');
		this.resultsPane.setValue(this.sequences);
	},
	toggleDethreaded: function() {
		var dethreaded = this.down('[name=dethreaded]');
		if(dethreaded.pressed) {
			this.resultsPane.setValue(this.dethreaded);
		} else {			
			this.resultsPane.setValue(this.sequences);
		}
	},
	/**
	 * Normalizes possibly discontinuous sequence numbers into continuous lists
	 */
	normalize : function() {
		var strands = this.smartSelect(this.strandsPane), namesStrands, namesList, strandsList;
		namesStrands = _.map(strands, function(strand) {
			return _.map(strand.split(':'), function(s) {
				return s.trim();
			});
		})
		namesStrands = _.zip.apply(_, namesStrands);
		namesList = _.compact(namesStrands[0]);
		strandsList = _.compact(namesStrands[1]);
		strandsList = DNA.normalizeSystem(strandsList);

		this.strandsPane.setValue(_.map(_.zip(namesList, strandsList), function(pair) {
			return pair[0] + ' : ' + DNA.encodeStrand(pair[1]);
		}).join('\n'));
	},
	/**
	 * Sets the value of the #strandsPane
	 */
	setStrands : function(data) {
		this.strandsPane.setValue(data);
	},
	/**
	 * Sets the value of the #sequencesPane
	 */
	setSequences : function(data) {
		this.sequencesPane.setValue(data);
	},
})