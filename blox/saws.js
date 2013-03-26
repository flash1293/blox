var saws = (function(saws) {

/**
  @class A Basic rectangle.
  @example
  rect = new saws.Rect(5,5,20,20)
  rect.right  // -> 25
  rect.bottom // -> 25
  rect.move(10,20)
  rect.right  // -> 35
  rect.bottom // -> 45
  rect.width  // -> 20
  rect.height // -> 20
*/
saws.Rect = function Rect(x, y, width, height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
  this.right = x + width
  this.bottom = y + height
}

/** Return position as [x,y] */
saws.Rect.prototype.getPosition = function() {
  return [this.x, this.y]
}


saws.Rect.prototype.shrink = function(offset) {
	this.x += offset;
	this.y += offset;
	return this;
}

saws.Rect.prototype.inflate = function(offset) {
	this.x -= offset;
	this.y -= offset;
	this.right += offset;
	this.bottom += offset;
	return this;
}


/** Move rect x pixels horizontally and y pixels vertically */
saws.Rect.prototype.move = function(x,y) {
  this.x += x
  this.y += y
  this.right += x
  this.bottom += y
  return this
}

/** Set rects x/y */
saws.Rect.prototype.moveTo = function(x,y) {
  this.x = x
  this.y = y
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Modify width and height */
saws.Rect.prototype.resize = function(width,height) {
  this.width += width
  this.height += height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}
/** Set width and height */
saws.Rect.prototype.resizeTo = function(width,height) {
  this.width = width
  this.height = height
  this.right = this.x + this.width
  this.bottom = this.y + this.height
  return this
}

/** Draw rect in color red, useful for debugging */
saws.Rect.prototype.draw = function() {
  saws.context.strokeStyle = "red"
  saws.context.strokeRect(this.x, this.y, this.width, this.height)
  return this
}

/** Returns true if point at x, y lies within calling rect */
saws.Rect.prototype.collidePoint = function(x, y) {
  return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom)
}

/** Returns true if calling rect overlaps with given rect in any way */
saws.Rect.prototype.collideRect = function(rect) {
  return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
         ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom))
}

/*
// Possible future functions
saws.Rect.prototype.collideRightSide = function(rect)  { return(this.right >= rect.x && this.x < rect.x) }
saws.Rect.prototype.collideLeftSide = function(rect)   { return(this.x > rect.x && this.x <= rect.right) }
saws.Rect.prototype.collideTopSide = function(rect)    { return(this.y >= rect.y && this.y <= rect.bottom) }
saws.Rect.prototype.collideBottomSide = function(rect) { return(this.bottom >= rect.y && this.y < rect.y) }
*/

saws.Rect.prototype.toString = function() { return "[Rect " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "]" }

return saws;
})(saws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports.Rect = saws.Rect }

var saws = (function(saws) {

/**
* @class A basic but powerfull sprite for all your onscreen-game objects. "Field Summary" contains options for the Sprite()-constructor.
* @constructor
*  
* @property {int} x     Horizontal position  (0 = furthest left)
* @property {int} y     Vertical position    (0 = top)
* @property {image} image   Image/canvas or string pointing to an asset ("player.png")
* @property {int} alpha     Transparency 0=fully transparent, 1=no transperency
* @property {int} angle     Angle in degrees (0-360)
* @property {bool} flipped    Flip sprite horizontally, usefull for sidescrollers
* @property {string} anchor   String stating how to anchor the sprite to canvas, @see Sprite#anchor ("top_left", "center" etc)
* @property {int} scale_image Scale the sprite by this factor
*
* @example
* // create new sprite at top left of the screen, will use saws.assets.get("foo.png")
* new Sprite({image: "foo.png", x: 0, y: 0}) 
* 
* // sets anchor to "center" on creation
* new Sprite({image: "topdownspaceship.png", anchor: "center"})
*
*/
saws.Sprite = function Sprite(options) {
  this.options = options;
  this.set(options);
}

/** 
 * @private
 * Call setters from JSON object. Used to parse options.
 */
saws.Sprite.prototype.set = function(options) {
  this.scale_x = this.scale_y = (options.scale || 1)
  this.x = options.x || 0
  this.y = options.y || 0
  this.alpha = (options.alpha === undefined) ? 1 : options.alpha
  this.angle = options.angle || 0
  this.flipped = options.flipped || false
  this.anchor(options.anchor || "top_left");
  if(options.anchor_x !== undefined) this.anchor_x = options.anchor_x;
  if(options.anchor_y !== undefined) this.anchor_y = options.anchor_y; 
  this.image = {width:options.width, height: options.height};
  this.cacheOffsets()

  return this
}

/** 
 * @private
 *
 * Creates a new sprite from current sprites attributes()
 * Checks sawsJS magic property '_constructor' when deciding with which constructor to create it
 *
 */
saws.Sprite.prototype.clone = function(object) {
  var constructor = this._constructor ? eval(this._constructor) : this.constructor
  var new_sprite = new constructor( this.attributes() );
  new_sprite._constructor = this._constructor || this.constructor.name
  return new_sprite
}


/** Flips image vertically, usefull for sidescrollers when player is walking left/right */
saws.Sprite.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
saws.Sprite.prototype.flipTo =        function(value) { this.flipped = value; return this }
/** Rotate sprite by value degrees */
saws.Sprite.prototype.rotate =        function(value) { this.angle += value; return this }
/** Force an rotation-angle on sprite */
saws.Sprite.prototype.rotateTo =      function(value) { this.angle = value; return this }
/** Set x/y */
saws.Sprite.prototype.moveTo =        function(x,y)   { this.x = x; this.y = y; return this }
/** Modify x/y */
saws.Sprite.prototype.move =          function(x,y)   { if(x) this.x += x;  if(y) this.y += y; return this }
/** 
* scale sprite by given factor. 1=don't scale. <1 = scale down.  1>: scale up.
* Modifies width/height. 
**/
saws.Sprite.prototype.scale =         function(value) { this.scale_x *= value; this.scale_y *= value; return this.cacheOffsets() }
/** set scale factor. ie. 2 means a doubling if sprite in both directions. */
saws.Sprite.prototype.scaleTo =       function(value) { this.scale_x = this.scale_y = value; return this.cacheOffsets() }
/** scale sprite horizontally by scale_factor. Modifies width. */
saws.Sprite.prototype.scaleWidth =    function(value) { this.scale_x *= value; return this.cacheOffsets() }
/** scale sprite vertically by scale_factor. Modifies height. */
saws.Sprite.prototype.scaleHeight =   function(value) { this.scale_y *= value; return this.cacheOffsets() }

/** Sets x */
saws.Sprite.prototype.setX =          function(value) { this.x = value; return this }
/** Sets y */
saws.Sprite.prototype.setY =          function(value) { this.y = value; return this }

/** Position sprites top on the y-axis */
saws.Sprite.prototype.setTop =        function(value) { this.y = value + this.top_offset; return this }
/** Position sprites bottom on the y-axis */
saws.Sprite.prototype.setBottom =     function(value) { this.y = value - this.bottom_offset; return this }
/** Position sprites left side on the x-axis */
saws.Sprite.prototype.setLeft =       function(value) { this.x = value + this.left_offset; return this }
/** Position sprites right side on the x-axis */
saws.Sprite.prototype.setRight =      function(value) { this.x = value - this.right_offset; return this }

/** Set new width. Scales sprite. */
saws.Sprite.prototype.setWidth  =     function(value) { this.scale_x = value/this.image.width; return this.cacheOffsets() }
/** Set new height. Scales sprite. */
saws.Sprite.prototype.setHeight =     function(value) { this.scale_y = value/this.image.height; return this.cacheOffsets() }
/** Resize sprite by adding width */
saws.Sprite.prototype.resize =        function(width, height) { 
  this.scale_x = (this.width + width) / this.image.width
  this.scale_y = (this.height + height) / this.image.height
  return this.cacheOffsets()
}
/** 
 * Resize sprite to exact width/height 
 */
saws.Sprite.prototype.resizeTo =      function(width, height) {
  this.scale_x = width / this.image.width
  this.scale_y = height / this.image.height
  return this.cacheOffsets()
}

/**
* The sprites anchor could be describe as "the part of the sprite will be placed at x/y"
* or "when rotating, what point of the of the sprite will it rotate round"
*
* @example
* For example, a topdown shooter could use anchor("center") --> Place middle of the ship on x/y
* .. and a sidescroller would probably use anchor("center_bottom") --> Place "feet" at x/y
*/
saws.Sprite.prototype.anchor = function(value) {
  var anchors = {
    top_left: [0,0],
    left_top: [0,0],
    center_left: [0,0.5],
    left_center: [0,0.5],
    bottom_left: [0,1],
    left_bottom: [0,1],
    top_center: [0.5,0],
    center_top: [0.5,0],
    center_center: [0.5,0.5],
    center: [0.5,0.5],
    bottom_center: [0.5,1],
    center_bottom: [0.5,1],
    top_right: [1,0],
    right_top: [1,0],
    center_right: [1,0.5],
    right_center: [1,0.5],
    bottom_right: [1,1],
    right_bottom: [1,1]
  }

  if(a = anchors[value]) {
    this.anchor_x = a[0]
    this.anchor_y = a[1]
    if(this.image) this.cacheOffsets();
  }
  return this
}

/** @private */
saws.Sprite.prototype.cacheOffsets = function() {
  if(!this.image) { return }
  
  this.width = this.image.width * this.scale_x
  this.height = this.image.height * this.scale_y
  this.left_offset   = this.width * this.anchor_x
  this.top_offset    = this.height * this.anchor_y
  this.right_offset  = this.width * (1.0 - this.anchor_x)
  this.bottom_offset = this.height * (1.0 - this.anchor_y)

  if(this.cached_rect) this.cached_rect.resizeTo(this.width, this.height);
  return this
}

/** Returns a saws.Rect() perfectly surrouning sprite. Also cache rect in this.cached_rect. */
saws.Sprite.prototype.rect = function() {
  if(!this.cached_rect) this.cached_rect = new saws.Rect(this.x, this.top, this.width, this.height)
  this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset)
  return this.cached_rect
} 

saws.Sprite.prototype.toString = function() { return "[Sprite " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

/** returns Sprites state/properties as a pure object */
saws.Sprite.prototype.attributes = function() { 
  var object = this.options                   // Start with all creation time properties
  object["_constructor"] = this._constructor || "saws.Sprite"
  object["x"] = parseFloat(this.x.toFixed(2))
  object["y"] = parseFloat(this.y.toFixed(2))
  object["image"] = this.image_path
  object["alpha"] = this.alpha
  object["flipped"] = this.flipped
  object["angle"] = parseFloat(this.angle.toFixed(2))
  object["scale_x"] = this.scale_x;
  object["scale_y"] = this.scale_y;
  object["anchor_x"] = this.anchor_x
  object["anchor_y"] = this.anchor_y

  return object
}

/**
 * returns a JSON-string representing the state of the Sprite.
 *
 * Use this to serialize your sprites / game objects, maybe to save in local storage or on a server
 *
 * saws.game_states.Edit uses this to export all edited objects.
 *
 */
saws.Sprite.prototype.toJSON = function() {
  return JSON.stringify(this.attributes())
}

return saws;
})(saws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports.Sprite = saws.Sprite }

/*
// Chainable setters under consideration:
saws.Sprite.prototype.setFlipped =        function(value) { this.flipped = value; return this }
saws.Sprite.prototype.setAlpha =          function(value) { this.alpha = value; return this }
saws.Sprite.prototype.setAnchorX =        function(value) { this.anchor_x = value; this.cacheOffsets(); return this }
saws.Sprite.prototype.setAnchorY =        function(value) { this.anchor_y = value; this.cacheOffsets(); return this }
saws.Sprite.prototype.setAngle =          function(value) { this.angle = value; return this }
saws.Sprite.prototype.setScale =    function(value) { this.scale_x = this.scale_y = value; this.cacheOffsets(); return this }
saws.Sprite.prototype.setScaleX =   function(value) { this.scale_x = value; this.cacheOffsets(); return this }
saws.Sprite.prototype.setScaleY =   function(value) { this.scale_y = value; this.cacheOffsets(); return this }
saws.Sprite.prototype.moveX =         function(x)     { this.x += x; return this }
saws.Sprite.prototype.moveXTo =       function(x)     { this.x = x; return this }
saws.Sprite.prototype.moveY =         function(y)     { this.y += y; return this }
saws.Sprite.prototype.moveYTo =       function(y)     { this.y = y; return this }
saws.Sprite.prototype.scaleWidthTo =  function(value) { this.scale_x = value; return this.cacheOffsets() }
saws.Sprite.prototype.scaleHeightTo = function(value) { this.scale_y = value; return this.cachOfffsets() }
*/



var saws = (function(saws) {

/**
 * @class Create and access tilebased 2D maps with very fast access of invidual tiles. "Field Summary" contains options for the TileMap()-constructor.
 *
 * @property {array} cell_size        Size of each cell in tilemap, defaults to [32,32]
 * @property {array} size             Size of tilemap, defaults to [100,100]
 * @property {function} sortFunction  Function used by sortCells() to sort cells, defaults to no sorting
 *
 * @example
 * var tile_map = new TileMap({size: [10, 10], cell_size: [16,16]})
 * var sprite = new saws.Sprite({x: 40, y: 40})
 * var sprite2 = new saws.Sprite({x: 41, y: 41})
 * tile_map.push(sprite)
 *
 * tile_map.at(10,10)  // []
 * tile_map.at(40,40)  // [sprite]
 * tile_map.cell(0,0)  // []
 * tile_map.cell(1,1)  // [sprite]
 *
 */
saws.TileMap = function TileMap(options) {
  this.cell_size = options.cell_size || [32,32]
  this.size = options.size || [100,100]
  this.sortFunction = options.sortFunction
  this.cells = new Array(this.size[0])

  for(var col=0; col < this.size[0]; col++) {
    this.cells[col] = new Array(this.size[1])
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = [] // populate each cell with an empty array
    }
  }
}

/** Clear all cells in tile map */
saws.TileMap.prototype.clear = function() {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row] = []
    }
  }
}


saws.TileMap.prototype.clearCell = function(x,y) {
	if(this.cells[x] == undefined) return;
	if(this.cells[x][y] == undefined) return;
	this.cells[x][y] = [];
}

/** Sort arrays in each cell in tile map according to sorter-function (see Array.sort) */
saws.TileMap.prototype.sortCells = function(sortFunction) {
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].sort( sortFunction )
    }
  }
}

/**
 * Push obj (or array of objs) into our cell-grid.
 *
 * Tries to read obj.x and obj.y to calculate what cell to occopy
 */
saws.TileMap.prototype.push = function(obj) {
  var that = this
  if(obj.forEach) { 
    obj.forEach( function(item) { that.push(item) } )
    return obj
  }
  if(obj.rect) {
    return this.pushAsRect(obj, obj.rect())
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}
/** 
 * Push objects into tilemap.
 * Disregard height and width and only use x/y when calculating cell-position
 */
saws.TileMap.prototype.pushAsPoint = function(obj) {
  if(Array.isArray(obj)) { 
    for(var i=0; i < obj.length; i++) { this.pushAsPoint(obj[i]) }
    return obj
  }
  else {
    var col = parseInt(obj.x / this.cell_size[0])
    var row = parseInt(obj.y / this.cell_size[1])
    return this.pushToCell(col, row, obj)
  }
}

/** push obj into cells touched by rect */
saws.TileMap.prototype.pushAsRect = function(obj, rect) {
  var from_col = parseInt(rect.x / this.cell_size[0])
  var to_col = parseInt((rect.right-1) / this.cell_size[0])
  //saws.log("rect.right: " + rect.right + " from/to col: " + from_col + " " + to_col, true)

  for(var col = from_col; col <= to_col; col++) {
    var from_row = parseInt(rect.y / this.cell_size[1])
    var to_row = parseInt((rect.bottom-1) / this.cell_size[1])
    
    //saws.log("rect.bottom " + rect.bottom + " from/to row: " + from_row + " " + to_row, true)
    for(var row = from_row; row <= to_row; row++) {
      // console.log("pushAtRect() col/row: " + col + "/" + row + " - " + this.cells[col][row])
      this.pushToCell(col, row, obj)
    }
  }
  return obj
}

/** 
 * Push obj to a specific cell specified by col and row 
 * If cell is already occupied we create an array and push to that
 */
saws.TileMap.prototype.pushToCell = function(col, row, obj) {
  this.cells[col][row].push(obj)
  if(this.sortFunction) this.cells[col][row].sort(this.sortFunction);
  return this
}

//
// READERS
// 

/** Get objects in cell that exists at coordinates x / y  */
saws.TileMap.prototype.at = function(x, y) {
  var col = parseInt(x / this.cell_size[0])
  var row = parseInt(y / this.cell_size[1])
  // console.log("at() col/row: " + col + "/" + row)
  return this.cells[col][row]
}

/** Returns occupants of all cells touched by 'rect' */
saws.TileMap.prototype.atRect = function(rect) {
  var objects = []
  var items

  try {
    var from_col = parseInt(rect.x / this.cell_size[0])
	if (from_col < 0) {
		from_col = 0
	}
    var to_col = parseInt(rect.right / this.cell_size[0])
    if (to_col >= this.size[0]) {
		to_col = this.size[0] - 1
	}
	var from_row = parseInt(rect.y / this.cell_size[1])
	if (from_row < 0) {
		from_row = 0
	}
	var to_row = parseInt(rect.bottom / this.cell_size[1])
	if (to_row >= this.size[1]) {
		to_row = this.size[1] - 1
	}

    for(var col = from_col; col <= to_col; col++) {
      for(var row = from_row; row <= to_row; row++) {
        this.cells[col][row].forEach( function(item, total) { 
           //if(objects.indexOf(item) == -1) { objects.push(item) }
		objects.push(item);
        })
      }
    }
  }
  catch(e) {
    // ... problems
  }
  return objects
}

/** Returns all objects in tile map */
saws.TileMap.prototype.all = function() {
  var all = []
  for(var col=0; col < this.size[0]; col++) {
    for(var row=0; row < this.size[1]; row++) {
      this.cells[col][row].forEach( function(element, total) {
        all.push(element)
      });
    }
  }
  return all
}

/** Get objects in cell at col / row */
saws.TileMap.prototype.cell = function(col, row) {
  return this.cells[col][row]
}

/** Debugstring for TileMap() */
saws.TileMap.prototype.toString = function() { return "[TileMap " + this.size[0] + " cols, " + this.size[1] + " rows]" }

return saws;
})(saws || {});

// Support CommonJS require()
if(typeof module !== "undefined" && ('exports' in module)) { module.exports.TileMap = saws.TileMap }
/**
 * @namespace Collisiondetection
 * 
 * Collision detection helpers.
 *
 * @example
 *   // collision helper exampels:
 *   collideOneWithOne(player, boss)        // -> false
 *   collideOneWithMany(player, bullets)    // -> [bullet1, bullet1]
 *   collideManyWithMany(bullets, enemies)  // -> [ [bullet1, enemy1], [bullet2, enemy2] ]
 *
 */
var saws = (function(saws) {

/**
 * collides 2 single objects by reading x, y and either method rect() or property radius.
 * returns true if the two objects are colliding.
 */
saws.collideOneWithOne = function(object1, object2) {
  if(object1.radius && object2.radius && object1 !== object2 && saws.collideCircles(object1, object2))          return true;
  if(object1.rect && object2.rect && object1 !== object2 && saws.collideRects( object1.rect(), object2.rect())) return true;
  return false;
}

/**
 * collide one single object 'object' with a list of objects 'list'.
 * returns an array of items from 'list' that collided with 'object'.
 * returns empty array of no collisions are found.
 * will never collide objects with themselves.
 */
saws.collideOneWithMany = function(object, list) {
  return list.filter( function(item) { return saws.collideOneWithOne(object, item) } ) 
}

/**
 * Collides two list/arrays of objects -- 'list1' and 'list2'.
 * Returns an array of arrays with colliding pairs from 'list1' and 'list2'.
 * Will never collide objects with themselves, even if you collide the same list with itself.
 *
 * @example
 *
 *   saws.collideManyWithMany(bullets, enemies) // --> [[bullet, enemy], [bullet, enemy]]
 *
 */
saws.collideManyWithMany = function(list1, list2) {
  var a = []

  if(list1 === list2) {
    combinations(list1, 2).forEach( function(pair) {
      if( saws.collideOneWithOne(pair[0], pair[1]) ) a.push([pair[0], pair[1]]);
    });
  }
  else {
    list1.forEach( function(item1) { 
      list2.forEach( function(item2) { 
        if(saws.collideOneWithOne(item1, item2)) a.push([item1, item2])
      });
    });
  }

  return a;
}
  

/** 
 * Returns true if circles collide.
 * Takes two objects with properties "radius" as argument.
 */
saws.collideCircles = function(object1, object2) {
  return ( saws.distanceBetween(object1, object2) < object1.radius + object2.radius )
}

/** 
 * Returns true if 'rect1' collides with 'rect2'
 */
saws.collideRects = function(rect1, rect2) {
  return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
         ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom))
}

/** 
 * returns the distance between 2 objects
 */
saws.distanceBetween = function(object1, object2) {
  return Math.sqrt( Math.pow(object1.x-object2.x, 2) +  Math.pow(object1.y-object2.y, 2) )
}

/** private */
function combinations(list, n) {
  var f = function(i) {
    if(list.isSpriteList !== undefined) {
      return list.at(i)
    } else {  // s is an Array
      return list[i];
    }
  };
  var r = [];
  var m = new Array(n);
  for (var i = 0; i < n; i++) m[i] = i; 
  for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length) {
    r.push( m.map(f) );
    while (0 <= i && m[i] == sn - 1) { i--; sn--; }
    if (0 <= i) { 
      m[i] += 1;
      for (var j = i + 1; j < n; j++) m[j] = m[j-1] + 1;
      i = n - 1;
    }
  }
  return r;
}

/** @private */
function hasItems(array) { return (array && array.length > 0) }


/*
 * @deprecated
 *
 * Collides 2 objects or list with objects.
 * Returns empty array if no collision took place
 * Returns array of array with object-pairs that collided
 *
 * @examples
 *   saws.collide(player, enemy)     // --> [player, enemy]
 *   saws.collide(player, enemies)   // --> [[player, enemies[2]]
 *   saws.collide(bullets, enemies)  // [ [bullet1, enemy1], [bullet2, ememy3] ]
 *
 */
/*
saws.collide = function(object1, object2) {
  var a = []
  if(object1.radius && object2.radius && object1 !== object2 && saws.collideCircles(object1, object2))  { return [object1, object2]; }
  if(object1.rect && object2.rect && object1 !== object2 && saws.collideRects( object1.rect(), object2.rect())) { return [object1, object2]; }
  if(object1.forEach) a = object1.map( function(item1) { return saws.collide(item1, object2) } ).filter(hasItems);
  if(object2.forEach) a = object2.map( function(item2) { return saws.collide(item2, object1) } ).filter(hasItems);

  // Convert [[[1,2],[2,2]]] -> [[1,1],[2,2]] (flatten one outer array wrapper)
  if(a[0] && a[0].length == 1)  return a[0];
  else                          return a;
}
*/

return saws;
})(saws || {});