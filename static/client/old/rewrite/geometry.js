/**
 * @class Point
 * Encapsulates a point in x,y space
 */
 function Point() {
   if(arguments.length == 1 && Ext.isArray(arguments[0])) {
     this.fromArray(arguments[0]);
   } else if(arguments.length == 1 && Ext.isObject(arguments[0])) {
     this.fromObject(arguments[0])
   } else if (argument.length == 2) {
     this.setPosition(arguments[0],arguments[1]);
   }
 }
 
 Ext.extend(Point,{
   /**
    * fromArray
    * Sets this point's coordinates from an array
    * @param {Array} point An array containing the x,y coordinates of the point
    */
   fromArray: function(array) {
     this.x = array[0];
     this.y = array[1];
   },
   /**
    * fromObject
    * Sets this point's coordinates from a hash
    * @param {Object} point An object hash containing the x,y coordinates of the point
    */
   fromObject: function(obj) {
     this.x = obj.x;
     this.y = obj.y;
   },
   /**
    * setPosition
    * Sets the position of this point
    * @param {Number} x 
    * @param {Number} y
    */
   setPosition(x,y) {
     this.x = x; this.y = y;
   },
   /**
    * translate
    * Translates the point by the given amount
    * @param {Number} dx Change in the x direction
    * @param {Number} dy Change in the y direction
    */
   translate: function(dx, dy) {
     dx = dx || 0;
     dy = dy || 0;
     this.x+=dx; 
     this.dy+=dy;
   },
   /**
    * distance
    * Returns the distance between this point and another given point
    * @param {Point} point
    * @return {Number} distance
    */
   distance: function(p) {
     return Math.sqrt(Math.exp(this.x-p.x,2)+Math.exp(this.y-p.y,2));
   },
   /**
    * angle
    * Returns the angle between this point and another given point, in radians
    * @param {Point} point
    * @return {Number} angle
    */
   angle: function(p) {
     
   },
   /**
    * delta
    * Returns a vector representing the translation between this point and the given point
    */
   delta: function(p) {
     return new Vector(p.x-this.x,p.y-this.y);
   }
 });
 
 var Vector = function() {
   Vector.superclass.constructor.apply(this)
 }
 var Vector = Ext.extend(Vector, Point,{
   
 }); 
 
 /**
  * @class Box
  */
  
 var Box = function() {
   
 };
 Ext.extend(Box,{
   
 })
 
