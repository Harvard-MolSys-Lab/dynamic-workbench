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
		this.shimConfig = this.shimConfig || {};
		Ext.applyIf(this.shimConfig, {
			property: 'name'
		});

		// set up the label editor
		this.addShim(Ext.create('Workspace.Label',this.shimConfig));

		this._children = this.children;
		this.children = Ext.create('Ext.util.MixedCollection');
		this.initLayout(this.layout); //new Workspace.idea.FreeLayout({idea: this});

		this.expose('children', true, false, true, false);
		this.expose('layout', function() {
			return this.layout.ltype
		}, function(ltype) {
			this.initLayout(ltype)
		}, true, false);
	},
	requires: ['Workspace.Label','Ext.util.MixedCollection'],
	extend: 'Workspace.objects.Rectangle',
	wtype: 'Workspace.objects.IdeaObject',
	layout: 'Workspace.idea.FreeLayout',
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
	initialize: function() {
		this.callParent(arguments);
		//Workspace.objects.IdeaObject.superclass.initialize.apply(this, arguments);
		this.buildChildren();
	},
	initLayout: function(ltype) {
		this.layout = Workspace.Layouts.create(ltype, {
			idea: this
		});
		if(this.rendered) {
			this.layout.doFirstLayout();
		}
	},
	/**
	 * buildChildren
	 * Realizes child objects passed to constructor. Automatically invoked by initialize
	 * @private
	 */
	buildChildren: function() {
		var children = this._children;
		if (Ext.isArray(children)) {
			Ext.each(children, function(child) {
				this.addChild(Workspace.Components.realize(child));
			},
			this)
		} else if (Ext.isObject(children)) {
			var child;
			for (var id in children) {
				child = children[id];
				this.addChild(Workspace.Components.realize(child))
			}
		}
	},
	/**
	 * addChild
	 * Adds a child to this idea
	 * @param {Workspace.Object} child
	 */
	addChild: function(child) {
		this.children.add(child);
		child.setParent(this);
		child.on('move', this.adjustSize, this);
		child.on('resize', this.adjustSize, this);
		if(child.is('rendered')) {
			this.adjustSize();
		}
	},
	/**
	 * adopt
	 * Alias for {@link #addChild}
	 */
	adopt: function() {
		this.addChild.apply(this, arguments);
	},
	/**
	 * removeChild
	 * Removes a child from this idea
	 * @param {Workspace.Object} child
	 */
	removeChild: function(child) {
		this.children.remove(child);//.getId());
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
