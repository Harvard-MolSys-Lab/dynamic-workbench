Ext.define('App.ui.SequenceThreader', {
	extend: 'Ext.window.Window',
	layout: 'fit',
	width:400,
	height: 400,
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			margins: 5,
			tbar: [{
				text: 'Thread',
				handler: this.thread,
				scope: this,
			},{
				text: 'Normalize',
				handler: this.normalize,
				scope: this,
			},{
				text: 'Truncate',
				handler: this.truncate,
				scope: this,
			}],
			items:[new App.ui.CodeMirror({
				region: 'west',
				width: 200,
				split: true,
				ref: 'sequencesPane',
				mode: 'sequence',
				title: 'Sequence',
			}),new App.ui.CodeMirror({
				region: 'center',
				ref: 'strandsPane',
				mode: 'nupack',
				title: 'Strands',
			}),new App.ui.CodeMirror({
				region: 'south',
				ref: 'resultsPane',
				mode: 'sequence',
				height: 200,
				split: true,
				title: 'Results',
			})],
			buttons: [{
				text: 'Done'
			}]
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
	},
	smartSelect: function(editor) {
		return App.ui.SequenceEditor.prototype.smartSplit.call(editor,editor.getValue());
	},
	thread: function() {
		var seqs = this.smartSelect(this.sequencesPane),
		strands = this.smartSelect(this.strandsPane), strandsList = {}, namesList;
		// _.each(_.map(strands, function(strand) {
		// return strand.split(':');
		// }),function(pair,list,i) {
		// if(pair.length > 1) {
		// strandsList.push({name: pair[0].trim(), strand: pair[1]});
		// //namesList[i] = pair[0];
		// //newStrandList[i] = pair[1];
		// } else {
		// strandsList.push({strand: pair[1].trim()});
		// }
		// });
		seqs = _.compact(_.map(seqs, function(seq) {
			return seq.trim();
		}));
		strandsList = DNA.normalizeSystem(_.compact(_.map(strands, function(strand) {
			return _.last(strand.split(':')).trim();
		})));
		//seqs.unshift('');
		var out = '';
		_.each(strandsList, function(spec,list,i) {
			out+= (DNA.threadSegments(seqs,spec)+'\n');
		});
		this.resultsPane.setValue(out);

	},
	normalize: function() {
		var strands = this.smartSelect(this.strandsPane), namesStrands, namesList, strandsList;
		namesStrands = _.map(strands, function(strand) {
			return _.map(strand.split(':'), function(s) {
				return s.trim();
			});
		})
		namesStrands = _.zip.apply(_,namesStrands);
		namesList = _.compact(namesStrands[0]);
		strandsList = _.compact(namesStrands[1]);
		strandsList = DNA.normalizeSystem(strandsList);

		this.strandsPane.setValue(_.map(_.zip(namesList,strandsList), function(pair) {
			return pair[0]+' : '+DNA.encodeStrand(pair[1]);
		}).join('\n'));
	},
	setStrands: function(data) {
		this.strandsPane.setValue(data);
	},
	setSequences: function(data) {
		this.sequencesPane.setValue(data);
	},
})