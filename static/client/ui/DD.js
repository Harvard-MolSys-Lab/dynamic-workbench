Ext.define('App.ui.DD', {
	extend: 'Ext.panel.Panel',
	mixins: {
		app: 'App.ui.Application'
	},
	mutating: false,
	initComponent: function() {
		var designer = this.designer = new DD();

		this.store = Ext.create('Ext.data.ArrayStore', {
			ref: 'store',
			fields: [{
				name: 'domain',
				type: 'int'
			},{
				name: 'sequence',
			},{
				name: 'importance',
				type: 'float',
			},{
				name: 'composition',
				type: 'int',
			},{
				name: 'score',
				type: 'float',
			},{
				name: 'target',
				type: 'bool',
				defaultValue: false,
			}
			],
			data: []
		});

		var cellEditor = this.cellEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 2,
			autoCancel: false
		});
		this.cellEditor.on('edit', function(editor,e) {
			this.designer.updateDomain(this.store.indexOf(e.record),e.record.get('sequence'),e.record.get('importance'),e.record.get('composition'));
			
		},this);
		this.targetColumn = Ext.create('Ext.ux.CheckColumn',{
				header: 'Target',
				dataIndex: 'target',
				width: 60,
				xtype: 'checkcolumn'
		});
		this.targetColumn.on('checkchange',function(col,i,checked) {
			var rec = this.store.getAt(i);
			 if(rec.get('target')) { 
				this.designer.targetDomain(i)
			} else {
				this.designer.untargetDomain(i)
			}
		},this);
			
		Ext.apply(this, {
			layout: 'fit',
			// items: {
			// xtype: 'panel',
			// ref: 'output',
			// },
			items: {
				xtype: 'gridpanel',
				bodyBorder: false,
				border: false,
				ref: 'grid',
				columns: [Ext.create('Ext.grid.RowNumberer',{
					width: 30,
				}),{
					header: 'Sequence',
					dataIndex: 'sequence',
					renderer: function(v) {
						var x = {
							innerHTML: '',
							nodeType: 1
						};
						CodeMirror.runMode(v.toUpperCase(),'sequence',x);
						return x.innerHTML;
					},
					editor: {
						allowBlank: false,
					},
					flex: 1
				},{
					header: 'Importance',
					dataIndex: 'importance',
					width: 100,
					editor: {
						xtype: 'numberfield',
						allowBlank: false,
					}
				},{
					header: 'Composition',
					dataIndex: 'composition',
					renderer:  Ext.bind( function(v) {
						v = this.designer.printComposition(v);
						var x = {
							innerHTML: '',
							nodeType: 1
						};
						CodeMirror.runMode(v.toUpperCase(),'sequence',x);
						return x.innerHTML;
					},this),
					width: 100,
					editor: {
						xtype: 'numberfield'
					},
					// editor: {
					// xtype: 'combobox',
					// store: Ext.create('Ext.data.Store',{
					// fields: ['base','value'],
					// data: [{base: 'G', value: 8},{base: 'A',value: 4},{base: 'T', value: 2},{base: 'C', value: 1}]
					// }),
					// queryMode: 'local',
					// multiSelect: true,
					// allowBlank: false,
					// displayField: 'base',
					// valueField: 'value',
					// setValue: function(v,doSelect) {
					// v = _.compact([v & 8 >> 3, v & 4 >> 2, v & 2 >> 1, v & 1]);
					// this.callParent([v,doSelect]);
					// },
					// getValue: function() {
					// var x = this.callParent(arguments);
					// console.log(x);
					// },
					// }
				},{
					header: 'Score',
					dataIndex: 'score',
					width: 100,
					editable: false,
				},this.targetColumn],
				store: this.store,
				plugins: [this.cellEditor]
			},
			tbar: [{
				text: 'Mutate',
				iconCls: 'play',
				ref: 'mutateButton',
				handler: this.toggleMutation,
				scope: this,
			},'-',{
				text: 'Add',
				ref: 'addDomainButton',
				handler: this.doAddDomain,
				scope: this,
				iconCls: 'plus',
				xtype: 'splitbutton',
				menu: [{
					text: 'New domain length: ',
					canActivate: false,
				},{
					xtype: 'numberfield',
					ref: 'addDomLen',
					value: 8,
					min: 2,
					indent: true,
				},{
					text: 'Add Domain',
					iconCls: 'tick',
					ref: 'addDomainItem',
					handler: this.doAddDomain,
					scope: this,
				},'-',{
					text: 'Add specific domains...',
					handler: this.addManyDomains,
					scope: this,
				}]
			},{
				text: 'Modify',
				ref: 'modDomainButton',
				iconCls: 'edit',
				xtype: 'splitbutton',
				handler: function() {
					this.cellEditor.startEdit(this.grid.getSelectionModel().getLastSelected(),this.grid.headerCt.getHeaderAtIndex(0));
				},
				scope: this,
				menu: [{
					text: 'Reseed Domain',
					handler: this.reseed,
					scope: this,
				},{
					text: 'Reseed All Domains',
					handler: this.reseedAll,
					scope: this,
				}]
			},{
				text: 'Delete',
				ref: 'delDomainButton',
				handler: this.doDeleteDomain,
				scope: this,
				iconCls: 'cross',
			},'-',{
				text: 'Advanced',
				iconCls: 'tools',
				menu: [{
					text: 'Design options',
					iconCls: 'wrench',
					handler: this.designOptions,
					scope: this,
				},{
					text: 'Tweak score parameters',
					iconCls: 'ui-slider',
					handler: this.scoreParams,
					scope: this,
				}]
			},'->',{
				text: 'Save',
				iconCls: 'save'
			}],
			bbar: new Ext.ux.statusbar.StatusBar({
				ref: 'statusBar',
				items: [{
					baseText: 'Score: ',
					text: 'Score: ',
					ref: 'scoreField',
				},{
					baseText: 'Attempts: ',
					text: 'Attempts: ',
					ref: 'attemptCount',
				},{
					baseText: 'Mutations: ',
					text: 'Mutations: ',
					ref: 'mutCount',
				}]
			})
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
	},
	reseed: function() {
		
	},
	reseedAll: function() {
		
	},
	updateOptions: function(v) {
		this.designer.updateOptions(v);
	},
	updateRules: function() {
		this.designer.updateRules(v);
	},
	designOptions: function () {
		if(!this.designOptionsWindow) {
			this.designOptionsWindow = Ext.create('App.ui.DD.RulesWindow',{designer:this.designer, closeAction: 'hide'});
		}
		this.designOptionsWindow.setValues(this.designer.getRules());
		this.designOptionsWindow.show();
	},
	scoreParams: function() {
		if(!this.scoreParamsWindow) {
			this.scoreParamsWindow = Ext.create('App.ui.DD.OptionsWindow',{designer:this.designer, closeAction: 'hide'});
		}
		this.scoreParamsWindow.setValues(this.designer.getOptions());
		this.scoreParamsWindow.show();
	},
	updateStatusBar: function() {
		var attempts = this.designer.getMutationAttempts(),
		muts = this.designer.getMutationCount(),
		score = this.designer.getWorstScore();
		this.attemptCount.setText(this.attemptCount.baseText+attempts);
		this.mutCount.setText(this.mutCount.baseText+muts);
		this.scoreField.setText(this.scoreField.baseText+score);
	},
	doDeleteDomain: function() {
		var rec = this.grid.getSelectionModel().getLastSelected();
		if(rec) {
			this.designer.removeDomain(this.store.indexOf(rec));
			this.store.remove(rec);
		}
	},
	addManyDomains: function() {
		if(!this.addDomainsWindow) {
			this.addDomainsWindow = Ext.create('App.ui.DD.SequenceWindow',{designer:this});
		}
		this.addDomainsWindow.show();
	},
	addDomains: function(seqs) {
		var imp = 1, comp = 15;
		this.designer.addDomains(seqs,imp,comp);
		this.store.add(_.map(seqs,function(seq) {
			return {
				sequence: seq,
				importance: imp,
				composition: comp,
			}; 
		},this));
		this.scoresDirty = true;
		this.designer.evaluateIntrinsicScores();
	},
	doAddDomain: function() {
		var len = this.addDomLen.getValue();
		var seq = this.designer.randomSequence(1,len)[0];
		this.addDomain(this.designer.printfDomain(seq),1,15);
	},
	addDomain: function(seq,imp,comp) {
		// false to not clobber
		this.designer.addDomains([seq],imp,comp,false);
		this.store.add({
			sequence: seq,
			importance: imp,
			composition: comp,
		});
		this.designer.evaluateIntrinsicScores();
		this.scoresDirty = true;
	},
	toggleMutation: function() {
		if(this.mutating) {
			this.pauseMutation();
		} else {
			this.startMutation();
		}
	},
	mutationStep: 50,
	mutationCount: 0,
	mutationLoop: function() {
		if(this.mutationCount > this.mutationStep) {
			this.updateInterface();
			this.mutationCount = 0;
		}
		this.mutationCount++;
		this.doMutation();
	},
	doMutation: function() {
		this.designer.mutate();
	},
	updateInterface: function() {
		this.updateStatusBar();
		// true to force a re-tally (since domain_score[] isn't automatically updated when a
		// mutation is rejected; we risk showing an increased score that was actually rejected)
		var scores = this.designer.getScores(true),
		mut_dom = this.designer.getMutatedDomain(),
		mut_dom_seq = this.designer.printfDomainById(mut_dom), rec;
		//this.output.update(this.designer.printDomains());
		// //this.store.suspendEvents();
		for(var i=0;i<scores.length;i++) {
			rec = this.store.getAt(i);//+1);
			if(rec.get('score') !=0 && rec.get('score') < scores[i]) {
				//throw "Score increase";
			}
			rec.set('score',scores[i]);
		}
		rec = this.store.getAt(mut_dom);
		rec.set('sequence',mut_dom_seq);
		//this.store.resumeEvents();
		this.store.sync();
		if(this.designer.getWorstScore() != _.max(scores)) {
			// throw 'Worst score increase'
		}
	},
	startMutation: function() {
		this.mutateButton.setIconCls('pause');
		_.invoke([this.modDomainButton,this.addDomainButton,this.delDomainButton],'disable');
		if(!this.mutationTask || this.scoresDirty) {
			this.designer.evaluateAllScores();
			this.scoresDirty = false;
		}
		if(!this.mutationTask) {
			this.mutationTask = Ext.TaskManager.start({
				run: this.mutationLoop,
				interval: 0.1,
				scope: this,
			});
		} else {
			this.mutationTask = Ext.TaskManager.start(this.mutationTask);
		}
		this.mutating = true;
	},
	pauseMutation: function() {
		this.mutateButton.setIconCls('play');
		_.invoke([this.modDomainButton,this.addDomainButton,this.delDomainButton],'enable');
		if(this.mutationTask) {
			Ext.TaskManager.stop(this.mutationTask);
		}
		this.mutating = false;
	}
});