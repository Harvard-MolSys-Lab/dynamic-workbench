/**
 * Provides an interface allowing a set of sequences (e.g. domains/segments) to
 * be "threaded" (connected in order, respecting complementarities) to a set of
 * strands, based on a specification.
 */
Ext.define('App.ui.SequenceThreader', {
	extend : 'Ext.window.Window',
	layout : 'fit',
	width : 400,
	height : 400,
	initComponent : function() {
		Ext.apply(this, {
			layout : 'border',
			margins : 5,
			tbar : [{
				text : 'Thread',
				handler : this.thread,
				scope : this,
			}, {
				text : 'Normalize',
				handler : this.normalize,
				scope : this,
			}, {
				text : 'Truncate',
				handler : this.truncate,
				scope : this,
			}],

			/**
			 * @property {App.ui.CodeMirror} sequencesPane
			 */
			items : [new App.ui.CodeMirror({
				region : 'west',
				width : 200,
				split : true,
				ref : 'sequencesPane',
				mode : 'sequence',
				title : 'Sequence',

				/**
				 * @property {App.ui.CodeMirror} strandsPane
				 */
			}), new App.ui.CodeMirror({
				region : 'center',
				ref : 'strandsPane',
				mode : 'nupack',
				title : 'Strands',

				/**
				 * @property {App.ui.CodeMirror} resultsPane
				 */
			}), new App.ui.CodeMirror({
				region : 'south',
				ref : 'resultsPane',
				mode : 'sequence',
				height : 200,
				split : true,
				title : 'Results',
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
		var seqs = this.smartSelect(this.sequencesPane), strands = this.smartSelect(this.strandsPane), strandsList = {}, namesList;
		seqs = _.compact(_.map(seqs, function(seq) {
			return seq.trim();
		}));
		strandsList = DNA.normalizeSystem(_.compact(_.map(strands, function(strand) {
			return _.last(strand.split(':')).trim();
		})));
		//seqs.unshift('');
		var out = '';
		_.each(strandsList, function(spec, list, i) {
			out += (DNA.threadSegments(seqs, spec) + '\n');
		});
		this.resultsPane.setValue(out);

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