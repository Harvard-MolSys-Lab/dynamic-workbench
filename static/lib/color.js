// color.js - version 0.3
//
// HSV <-> RGB code based on code from http://www.cs.rit.edu/~ncs/color/t_convert.html
// object function created by Douglas Crockford.
// Color scheme degrees taken from the colorjack.com colorpicker
//
// All other code copyright (c) Andrew Brehaut 2008.
// BSD License.


// this module function is called with net.brehaut as 'this'
(function ( ) {
  // Constants
  
  // css_colors maps color names onto their hex values
  // these names are defined by W3C
  var css_colors = {aliceblue:'#F0F8FF',antiquewhite:'#FAEBD7',aqua:'#00FFFF',aquamarine:'#7FFFD4',azure:'#F0FFFF',beige:'#F5F5DC',bisque:'#FFE4C4',black:'#000000',blanchedalmond:'#FFEBCD',blue:'#0000FF',blueviolet:'#8A2BE2',brown:'#A52A2A',burlywood:'#DEB887',cadetblue:'#5F9EA0',chartreuse:'#7FFF00',chocolate:'#D2691E',coral:'#FF7F50',cornflowerblue:'#6495ED',cornsilk:'#FFF8DC',crimson:'#DC143C',cyan:'#00FFFF',darkblue:'#00008B',darkcyan:'#008B8B',darkgoldenrod:'#B8860B',darkgray:'#A9A9A9',darkgrey:'#A9A9A9',darkgreen:'#006400',darkkhaki:'#BDB76B',darkmagenta:'#8B008B',darkolivegreen:'#556B2F',darkorange:'#FF8C00',darkorchid:'#9932CC',darkred:'#8B0000',darksalmon:'#E9967A',darkseagreen:'#8FBC8F',darkslateblue:'#483D8B',darkslategray:'#2F4F4F',darkslategrey:'#2F4F4F',darkturquoise:'#00CED1',darkviolet:'#9400D3',deeppink:'#FF1493',deepskyblue:'#00BFFF',dimgray:'#696969',dimgrey:'#696969',dodgerblue:'#1E90FF',firebrick:'#B22222',floralwhite:'#FFFAF0',forestgreen:'#228B22',fuchsia:'#FF00FF',gainsboro:'#DCDCDC',ghostwhite:'#F8F8FF',gold:'#FFD700',goldenrod:'#DAA520',gray:'#808080',grey:'#808080',green:'#008000',greenyellow:'#ADFF2F',honeydew:'#F0FFF0',hotpink:'#FF69B4',indianred:'#CD5C5C',indigo:'#4B0082',ivory:'#FFFFF0',khaki:'#F0E68C',lavender:'#E6E6FA',lavenderblush:'#FFF0F5',lawngreen:'#7CFC00',lemonchiffon:'#FFFACD',lightblue:'#ADD8E6',lightcoral:'#F08080',lightcyan:'#E0FFFF',lightgoldenrodyellow:'#FAFAD2',lightgray:'#D3D3D3',lightgrey:'#D3D3D3',lightgreen:'#90EE90',lightpink:'#FFB6C1',lightsalmon:'#FFA07A',lightseagreen:'#20B2AA',lightskyblue:'#87CEFA',lightslategray:'#778899',lightslategrey:'#778899',lightsteelblue:'#B0C4DE',lightyellow:'#FFFFE0',lime:'#00FF00',limegreen:'#32CD32',linen:'#FAF0E6',magenta:'#FF00FF',maroon:'#800000',mediumaquamarine:'#66CDAA',mediumblue:'#0000CD',mediumorchid:'#BA55D3',mediumpurple:'#9370D8',mediumseagreen:'#3CB371',mediumslateblue:'#7B68EE',mediumspringgreen:'#00FA9A',mediumturquoise:'#48D1CC',mediumvioletred:'#C71585',midnightblue:'#191970',mintcream:'#F5FFFA',mistyrose:'#FFE4E1',moccasin:'#FFE4B5',navajowhite:'#FFDEAD',navy:'#000080',oldlace:'#FDF5E6',olive:'#808000',olivedrab:'#6B8E23',orange:'#FFA500',orangered:'#FF4500',orchid:'#DA70D6',palegoldenrod:'#EEE8AA',palegreen:'#98FB98',paleturquoise:'#AFEEEE',palevioletred:'#D87093',papayawhip:'#FFEFD5',peachpuff:'#FFDAB9',peru:'#CD853F',pink:'#FFC0CB',plum:'#DDA0DD',powderblue:'#B0E0E6',purple:'#800080',red:'#FF0000',rosybrown:'#BC8F8F',royalblue:'#4169E1',saddlebrown:'#8B4513',salmon:'#FA8072',sandybrown:'#F4A460',seagreen:'#2E8B57',seashell:'#FFF5EE',sienna:'#A0522D',silver:'#C0C0C0',skyblue:'#87CEEB',slateblue:'#6A5ACD',slategray:'#708090',slategrey:'#708090',snow:'#FFFAFA',springgreen:'#00FF7F',steelblue:'#4682B4',tan:'#D2B48C',teal:'#008080',thistle:'#D8BFD8',tomato:'#FF6347',turquoise:'#40E0D0',violet:'#EE82EE',wheat:'#F5DEB3',white:'#FFFFFF',whitesmoke:'#F5F5F5',yellow:'#FFFF00',yellowgreen:'#9ACD32"'};
  
  // Package wide variables

  // becomes the top level prototype object
  var color;
  
  /* registered_odels contains the template objects for all the
   * models that have been registered for the color class.
   */
  var registered_models = [];
  
  
  /* factories contains methods to create new instance of 
   * different color models that have been registered.
   */
  var factories = {};
  
  // Utility functions
  
  /* object is Douglas Crockfords object function for prototypal
   * inheritance.
   */
  if (!this.object) {
    this.object = function (o) {
      function F () { }
      F.prototype = o;
      return new F();
    };
  }
  var object = this.object;
  
  /* takes a value, converts to string if need be, then pads it
   * to a minimum length.
   */
  function pad ( val, len ) {
    val = val.toString();
    var padded = [];

    for (var i = 0, j = Math.max( len - val.length, 0); i < j; i++) {
      padded.push('0');
    }
    
    padded.push(val);
    return padded.join('');
  }
  
  
  /* takes a string and returns a new string with the first letter
   * capitalised
   */
  function capitalise ( s ) {
    return s.slice(0,1).toUpperCase() + s.slice(1);
  }
  
  
  /* used to apply a method to object non-destructively by 
   * cloning the object and then apply the method to that 
   * new object
   */
  function cloneOnApply( meth ) {
    return function ( ) {
      var cloned = this.clone();
      meth.apply(cloned, arguments);
      return cloned;
    };
  }
  
  
  /* registerModel is used to add additional representations 
   * to the color code, and extend the color API with the new
   * operatiosn that model provides. see before for examples
   */
  function registerModel( name, model ) {
    var proto = object(color);
    var fields = []; // used for cloning and generating accessors    

    var to_meth = 'to'+ capitalise(name);
    
    function convertAndApply( meth ) { 
      return function ( ) {
        return meth.apply(this[to_meth](), arguments);
      };
    }
    
    for (var key in model) if (model.hasOwnProperty(key)) {
      proto[key] = model[key];
      var prop = proto[key];
      
      if (key.slice(0,1) == '_') { continue; }
      if (!(key in color) && "function" == typeof prop) {
        // the method found on this object is a) public and b) not
        // currently supported by the color object. Create an impl that
        // calls the toModel function and passes that new object
        // onto the correct method with the args.
        color[key] = convertAndApply(prop);
      }
      else if ("function" != typeof prop) {
        // we have found a public property. create accessor methods
        // and bind them up correctly
        fields.push(key);
        var getter = 'get'+capitalise(key);
        var setter = 'set'+capitalise(key);
        
        color[getter] = convertAndApply(
          proto[getter] = (function ( key ) {
            return function ( ) {
              return this[key];
            };
          })( key )
        );
        
        color[setter] = convertAndApply( 
          proto[setter] = (function ( key ) {
            return function ( val ) {
              var cloned = this.clone();
              cloned[key] = val;
              return cloned;
            };
          })( key )
        );        
      }
    } // end of for over model
    
    // a method to create a new object - largely so prototype chains dont 
    // get insane. This uses an unrolled 'object' so that F is cached
    // for later use. this is approx a 25% speed improvement
    function F () { }
    F.prototype = proto;
    function factory ( ) {
      return new F();
    }
    factories[name] = factory;
    
    proto.clone = function () {
      var cloned = factory();
      for (var i = 0, j = fields.length; i < j; i++) {
        var key = fields[i];
        cloned[key] = this[key];
      }
      return cloned;
    };
    
    color[to_meth] = function ( ) {
      return factory();
    };
    
    registered_models.push(proto);
    
    return proto;
  }// end of registerModel
  
  // Template Objects
  
  /* color is the root object in the color hierarchy. It starts
   * life as a very simple object, but as color models are 
   * registered it has methods programmatically added to manage 
   * conversions as needed.
   */
  color = {
    /* fromObject takes an argument and delegates to the internal
     * color models to try to create a new instance.
     */
    fromObject: function ( o ) {
      if (!o) {
        return object(color);
      }
      
      for (var i = 0, j = registered_models.length; i < j; i++) {
        var nu = registered_models[i].fromObject(o);
        if (nu) {
          return nu;
        }
      }
      
      return object(color);
    },
    
    toString: function ( ) {
      return this.toCSS();
    }
  };


  /* RGB is the red green blue model. This definition is converted 
   * to a template object by registerModel. 
   */   
  registerModel('RGB', {
    red:    0,
    green:  0,
    blue:   0,
    
    /* getLuminance returns a value between 0 and 1, this is the 
     * luminance calcuated according to 
     * http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
     */
    getLuminance: function ( ) {
      return (this.red * 0.2126) + (this.green * 0.7152) + (this.blue * 0.0722);
    },
    
    /* does an alpha based blend of color onto this. alpha is the 
     * amount of 'color' to use. (0 to 1)
     */
    blend: function ( color , alpha ) {
      color = color.toRGB();
      alpha = Math.min(Math.max(alpha, 0), 1); 
      var rgb = this.clone();
      
      rgb.red = (rgb.red * (1 - alpha)) + (color.red * alpha);
      rgb.green = (rgb.green * (1 - alpha)) + (color.green * alpha);
      rgb.blue = (rgb.blue * (1 - alpha)) + (color.blue * alpha);
      
      return rgb;
    },
    
    /* fromObject attempts to convert an object o to and RGB 
     * instance. This accepts an object with red, green and blue
     * members or a string. If the string is a known CSS color name
     * or a hexdecimal string it will accept it.
     */
    fromObject: function ( o ) {
      if ("string" == typeof o) {
        return this._fromCSS( o );
      }
      if (o.hasOwnProperty('red') && 
          o.hasOwnProperty('green') && 
          o.hasOwnProperty('blue')) {
        return this._fromRGB ( o );
      }
      // nothing matchs, not an RGB object
    },
    
    _fromCSS: function ( css ) {
      if (css in css_colors) {
        css = css_colors[css.toLowerCase()];
      }
      css = css.replace(/^#/,'');
      
      if (css.length === 0 || 
          css.length % 3 ||
          css.match(/[^0123456789aAbBcCdDeEfF]/)) {
        return;
      }

      var bytes = css.length / 3;
      
      var max = Math.pow(16, bytes) - 1;
      
      var rgb = factories.RGB();
      rgb.red =   parseInt('0x' + css.slice(0, bytes), 16) / max;
      rgb.green = parseInt('0x' + css.slice(bytes * 1,bytes * 2), 16) / max;
      rgb.blue =  parseInt('0x' + css.slice(bytes * 2), 16) / max;
      return rgb;
    },
    
    _fromRGB: function ( RGB ) {
      var newRGB = factories.RGB();
      
      newRGB.red = RGB.red;
      newRGB.green = RGB.green;
      newRGB.blue = RGB.blue;
      
      return newRGB;
    },
    
    // convert to a CSS string. defaults to two bytes a value 
    toCSS: function ( bytes ) {
      bytes = bytes || 2;
      var max = Math.pow(16, bytes) - 1;
      var css = [
        "#",
        pad ( Math.round(this.red * max).toString( 16 ).toUpperCase(), bytes ),
        pad ( Math.round(this.green * max).toString( 16 ).toUpperCase(), bytes ),
        pad ( Math.round(this.blue * max).toString( 16 ).toUpperCase(), bytes )
      ];
      
      return css.join('');
    },
    
    toHSV: function ( ) {
      var hsv = factories.HSV();
    	var min, max, delta;

      min = Math.min(this.red, this.green, this.blue);
      max = Math.max(this.red, this.green, this.blue);
      hsv.value = max;				// v

      delta = max - min;

      if( max !== 0 ) {
        hsv.saturation = delta / max;		// s
      }
      else {
        // r = g = b = 0		// s = 0, v is undefined
        hsv.saturation = 0;
        hsv.hue = -1;
        return hsv;
      }

      if( this.red == max ) {
        hsv.hue = ( this.green - this.blue ) / delta;		// between yellow & magenta
      }
      else if( this.green  == max ) {
        hsv.hue = 2 + ( this.blue - this.red ) / delta;	// between cyan & yellow
      }
      else {
        hsv.hue = 4 + ( this.red - this.green ) / delta;	// between magenta & cyan
      }

      hsv.hue *= 60;				// degrees
      if( hsv.hue < 0 ) {
        hsv.hue += 360;
      }
      
      return hsv;
    },
    
    toRGB: function ( ) {
      return this.clone();
    }
  });
  
  
  /* Like RGB above, this object describes what will become the HSV
   * template object. This model handles hue, saturation and value.
   * hue is the number of degrees around the color wheel, saturation
   * describes how much color their is and value is the brightness.
   */
  registerModel('HSV', {
    hue: 0,
    saturation: 0,
    value: 1,
    
    shiftHue: cloneOnApply(function ( degrees ) {
      var hue = (this.hue + degrees) % 360;
      if (hue < 0) {
        hue = (360 + hue) % 360
      }

      this.hue = hue;
    }),
    
    darkenByAmount: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value - val, 0));
    }),
    
    darkenByRatio: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value * (1 - val), 0));
    }),
    
    lightenByAmount: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value + val, 0));
    }),
    
    lightenByRatio: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value * (1 + val), 0));
    }),
    
    desaturateByAmount: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation - val, 0));
    }),

    desaturateByRatio: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation * (1 - val), 0));
    }),
    
    saturateByAmount: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation + val, 0));
    }),

    saturateByRatio: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation * (1 + val), 0));
    }),

    schemeFromDegrees: function ( degrees ) {
      var newColors = [];
      for (var i = 0, j = degrees.length; i < j; i++) {
        var col = this.clone();
        col.hue = (this.hue + degrees[i]) % 360;
        newColors.push(col);
      }
      return newColors;
    },
    
    complementaryScheme: function ( ) {
      return this.schemeFromDegrees([0,180]);
    },

    splitComplementaryScheme: function ( ) {
      return this.schemeFromDegrees([0,150,320]);
    },

    splitComplementaryCWScheme: function ( ) {
      return this.schemeFromDegrees([0,150,300]);
    },

    splitComplementaryCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,60,210]);
    },
    
    triadicScheme: function ( ) {
      return this.schemeFromDegrees([0,120,240]);
    },

    clashScheme: function ( ) {
      return this.schemeFromDegrees([0,90,270]);
    },
    
    tetradicScheme: function ( ) {
      return this.schemeFromDegrees([0,90,180,270]);
    },
    
    fourToneCWScheme: function ( ) {
      return this.schemeFromDegrees([0,60,180,240]);
    },

    fourToneCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,120,180,300]);
    },
    
    fiveToneAScheme: function ( ) {
      return this.schemeFromDegrees([0,115,155,205,245]);
    },
    
    fiveToneBScheme: function ( ) {
      return this.schemeFromDegrees([0,40,90,130,245]);
    },
    
    fiveToneCScheme: function ( ) {
      return this.schemeFromDegrees([0,50,90,205,320]);
    },
    
    fiveToneDScheme: function ( ) {
      return this.schemeFromDegrees([0,40,155,270,310]);
    },
    
    fiveToneEScheme: function ( ) {
      return this.schemeFromDegrees([0,115,230,270,320]);
    },
    
    sixToneCWScheme: function ( ) {
      return this.schemeFromDegrees([0,30,120,150,240,270]);
    },
    
    sixToneCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,90,120,210,240,330]);
    },

    neutralScheme: function ( ) {
      return this.schemeFromDegrees([0,15,30,45,60,75]);
    },

    analogousScheme: function ( ) {
      return this.schemeFromDegrees([0,30,60,90,120,150]);
    },
    
    fromObject: function ( o ) {
      if (o.hasOwnProperty('hue') &&
          o.hasOwnProperty('saturation') &&
          o.hasOwnProperty('value')) {
        var hsv = factories.HSV();
        
        hsv.hue = o.hue;
        hsv.saturation = o.saturation;
        hsv.value = o.value;
        
        return hsv;
      }
      // nothing matchs, not an HSV object
      return null;
    },
    
    _normalise: function ( ) {
       this.hue %= 360;
       this.saturation = Math.min(Math.max(0, this.saturation), 1);
       this.value = Math.min(Math.max(0, this.value));
    },

    toRGB: function ( ) {
      this._normalise();

      var rgb = factories.RGB();
    	var i;
      var f, p, q, t;
  
      if( this.saturation === 0 ) {
        // achromatic (grey)
        rgb.red = this.value;
        rgb.green = this.value;
        rgb.blue = this.value;
        return rgb;
      }

      var h = this.hue / 60;			// sector 0 to 5
      i = Math.floor( h );
      f = h - i;			// factorial part of h
      p = this.value * ( 1 - this.saturation );
      q = this.value * ( 1 - this.saturation * f );
      t = this.value * ( 1 - this.saturation * ( 1 - f ) );

      switch( i ) {
        case 0:
          rgb.red = this.value;
          rgb.green = t;
          rgb.blue = p;
          break;
        case 1:
          rgb.red = q;
          rgb.green = this.value;
          rgb.blue = p;
          break;
        case 2:
          rgb.red = p;
          rgb.green = this.value;
          rgb.blue = t;
          break;
        case 3:
          rgb.red = p;
          rgb.green = q;
          rgb.blue = this.value;
          break;
        case 4:
          rgb.red = t;
          rgb.green = p;
          rgb.blue = this.value;
          break;
        default:		// case 5:
          rgb.red = this.value;
          rgb.green = p;
          rgb.blue = q;
          break;
      }
      
      return rgb;
    },
    
    toHSV: function ( ) {
      return this.clone();
    }
  });
  
  // Package specific exports
  
  /* the Color function is a factory for new color objects.
   */
  this.Color = function ( o ) {
    return color.fromObject( o );
  };
}).call(window);