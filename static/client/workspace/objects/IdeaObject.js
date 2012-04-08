////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.IdeaObject
 * Represents an idea which groups various child objects together
 */
Ext.define('Workspace.objects.IdeaObject', {
	constructor: function(workspace, config) {
		Workspace.objects.IdeaObject.superclass.constructor.apply(this, arguments);

		if(this.autoFill) {
			// automatically set the fill to a nice random pastel color
			this.set('fill', Workspace.Utils.ideaColor());
		}
		

		this.initLayout(this.layout); //new Workspace.idea.FreeLayout({idea: this});

		this.expose('layout', function() {
			return this.layout.ltype
		}, function(ltype) {
			this.initLayout(ltype)
		}, true, false);
	},
	requires: ['Workspace.Label','Ext.util.MixedCollection'],
	extend: 'Workspace.objects.Rectangle',
	wtype: 'Workspace.objects.IdeaObject',
	/**
	 * @cfg {String} layout
	 * An ltype which can be instantiated to a subclass of Workspace.idea.BaseLayout
	 */
	layout: 'Workspace.idea.FreeLayout',
	showTitle: true,
	name: 'New Idea',
	iconCls: 'idea',
	r: 5,
	stroke: '#CCC',
	padding: 50,
	autoFill: true,
	destroyChildren: false,
	suspendLayout: false,

	render: function() {
		this.callParent(arguments);
		//Workspace.objects.IdeaObject.superclass.render.apply(this, arguments);
		//this.updateSize(false, false);
		this.layout.doFirstLayout();
		this.toBack();
	},
	/**
	 * Initializes the #layout from the configrued ltype
	 */
	initLayout: function(ltype) {
		/**
		 * @property {Workspace.idea.BaseLayout} layout
		 */
		this.layout = Workspace.Layouts.create(ltype, {
			idea: this
		});
		if(this.rendered) {
			this.layout.doFirstLayout();
		}
	},
	doLayout: function() {
		if(this.layout && this.layout.doLayout) {
			this.layout.doLayout();
		}
	},
	buildChildren: function() {
		this.suspendLayout = true;
		this.callParent(arguments);
		this.suspendLayout = false;
		this.adjustSize();
	},
	/**
	 * Adds a child to this idea
	 * @param {Workspace.Object} child
	 */
	addChild: function(child) {
		this.callParent(arguments);
		child.on('move', this.adjustSize, this);
		child.on('resize', this.adjustSize, this);
		if(child.is('rendered')) {
			this.adjustSize();
		}
	},
	/**
	 * Removes a child from this idea
	 * @param {Workspace.Object} child
	 */
	removeChild: function(child) {
		this.callParent(arguments);
		child.un('move', this.adjustSize, this);
		child.un('resize', this.adjustSize, this);
		this.adjustSize();
	},
	/**
	 * adjustSize
	 * invoked automatically when children are moved or resized
	 * @private
	 */
	adjustSize: function() {
		if(this.is('rendered')) {
			if (!this.ignoreTranslateChildren)
				this.updateSize(true, false);
		}
	},
	/**
	 * updateSize
	 * Recalculates this object's position and dimensions so that it is sized to contain all child objects
	 * @param {Boolean} union (Optional) true to apply Workspace.Components.boxUnion to this idea's current box (only allowing the box to be expanded) (Defaults to true)
	 * @param {Boolean} applyToChildren (Optional) true to apply changes in position to child objects (Defaults to true)
	 */
	updateSize: function(union, applyToChildren) {
		this.ignoreTranslateChildren = true;
		if(!this.suspendLayout) {
			this.layout.doLayout(applyToChildren);
		}
		this.ignoreTranslateChildren = false;
		// union = (union !== false);
		// applyToChildren = (applyToChildren !== false);
		// var attr = this.attributes(),
		// box = Workspace.Utils.getBox(this.children.getRange());
		// box = Workspace.Utils.padBox(box, this.padding);
		// if (union)
		// box = Workspace.Utils.boxUnion(box, this.getBox())
		// this.setBox(box, applyToChildren);
		// //!union);
	},
	childCanMove: function(child) {
		return this.layout.childrenMovable;
	},
	destroy: function() {
		if(this.destroyChildren) {
			this.workspace.deleteObjects(this.children.getRange());
		}
		this.layout.destroy();
		this.callParent(arguments);
	}
},function() {
	Workspace.reg('Workspace.objects.IdeaObject', Workspace.objects.IdeaObject);
});
