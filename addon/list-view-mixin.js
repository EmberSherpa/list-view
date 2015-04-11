// TODO: remove unused: false
/* jshint unused: false*/
import Ember from 'ember';
import ReusableListItemView from './reusable-list-item-view';

var Bin = window.Bin;

var get = Ember.get, set = Ember.set,
    min = Math.min, max = Math.max, floor = Math.floor,
    ceil = Math.ceil,
    forEach = Ember.EnumerableUtils.forEach;

function DimensionError(name, dimension) {
  Error.call(this);
  this.message = "Invalid " + name + ": `" +  dimension+ "`";
  this.dimension = dimension;
}

DimensionError.prototype = Object.create(Error.prototype);

function validateDimension(name, dimension) {
  if (dimension <= 0 || typeof dimension !== 'number' || dimension !== dimension) {
    throw new DimensionError(name, dimension);
  }

  return dimension;
}

function integer(key, value) {
  var cache = Ember.meta(this).cache || {};
  if (arguments.length > 1) {
    var ret;
    if (typeof value === 'string') {
      ret = parseInt(value, 10);
    } else {
      ret = value;
    }
    cache[key] = ret;
    Ember.meta(this).cache = cache;
    return ret;
  } else {
    return Ember.meta(this).cache[key];
  }
}

function typeKey(type) {
  if (typeof type === 'string') {
    return type;
  }
  return Ember.guidFor(type);
}

function contentKey(content) {
  if (typeof content.id === 'string' || typeof content.id === 'number') {
    return content.id;
  }
  return Ember.guidFor(content);
}

function ViewEntry(key, content, type, index, position) {
  this.key = key;
  this.content = content;
  this.type = type;
  this.index = index;
  this.position = position;

  this.typeKey = typeKey(type);
  this.view = null;
}

ViewEntry.prototype = {
  updatePosition: function (index, position) {
    if (this.position.x !== position.x ||
        this.position.y !== position.y) {
      this.position = position;
      this.view.updatePosition(position);
    }
    if (this.index !== index) {
      this.index = index;
      this.view.set('contentIndex', index);
    }
  },
  updateView: function (view) {
    this.view = view;
    view.set('contentIndex', this.index);
    view.updatePosition(this.position);
    view.updateContext(this.content);
  }
};

/**
  @class Ember.ListViewMixin
  @namespace Ember
*/
export default Ember.Mixin.create({
  itemViewClass: ReusableListItemView,
  emptyViewClass: Ember.View,
  classNames: ['ember-list-view'],
  attributeBindings: ['style'],
  classNameBindings: [
    '_isGrid:ember-list-view-grid:ember-list-view-list',
    '_isShelf:ember-list-view-shelf',
    '_isFixed:ember-list-view-fixed'
  ],

  _isFixed: false,
  _isShelf: false,
  _isGrid: false,

  scrollTop: 0,
  totalHeight: 0,


  /**
    @public

    Returns a view class for the provided contentIndex. If the view is
    different then the one currently present it will remove the existing view
    and replace it with an instance of the class provided

    @param {Number} contentIndex item index in the content array
    @method _addItemView
    @returns {Ember.View} ember view class for this index
  */
  itemViewForIndex: function(contentIndex) {
    return get(this, 'itemViewClass');
  },

  /**
    @public

    Returns a view class for the provided contentIndex. If the view is
    different then the one currently present it will remove the existing view
    and replace it with an instance of the class provided

    @param {Number} contentIndex item index in the content array
    @method _addItemView
    @returns {Ember.View} ember view class for this index
  */
  heightForIndex: null,

  /**
    @private

    Setup a mixin.
    - adding observer to content array
    - creating child views based on height and length of the content array

    @method init
  */
  init: function() {
    this._super();
    this._contentDirty = false;
    this._needsContentLayout = false;
    this._needsViewportLayout = false;
    this._needsRowsUpdate = true;

    this._width = 0;
    this._height = 0;
    this._elementWidth = undefined;
    this._rowHeight = undefined;
    this._totalHeight = 0;
    this._contentLength = 0;

    // represents the current rendering
    this._startingIndex = 0;
    this._numberVisible = 0;
    this._viewPools = {};
    this._viewMap = {};
    this._views = [];

    this._bin = this._setupBin();

    this.setContentDirty();
    this.setNeedsViewportLayout();
  },

  dequeueView: function (typeKey, type) {
    var viewPool = this._viewPools[typeKey];
    if (!viewPool) {
      this._viewPools[typeKey] = viewPool = {
        views: []
      };
    }
    var childView;
    if (viewPool.views.length) {
      childView = viewPool.views.pop();
      childView.set('isVisible', true);
    } else {
      childView = this.createChildView(type);
      this.pushObject(childView);
    }
    return childView;
  },

  enqueueView: function (typeKey, childView) {
    this._viewPools[typeKey].views.push(childView);
    childView.set('isVisible', false);
    childView.updateContext(null);
  },

  setNeedsViewportLayout: Ember.observer('height', function () {
    if (!this._needsViewportLayout) {
      this._needsViewportLayout = true;
      Ember.run.schedule('render', this, this.layoutIfNeeded);
    }
  }),

  setContentDirty: Ember.observer('content.[]', function () {
    this._contentDirty = true;
    this.setNeedsContentLayout();
  }),

  setNeedsContentLayout: Ember.observer('width', 'elementWidth', 'rowHeight', function () {
    if (!this._needsContentLayout) {
      this._needsContentLayout = true;
      this._bin.flush(0);
      Ember.run.schedule('render', this, this.layoutIfNeeded);
    }
  }),

  scrollToItem: function (item) {
    this.layoutIfNeeded();
    var index = this.get('content').indexOf(item);
    if (index >= 0) {
      var pos = this._bin.position(index, this._width);
      this.scrollTo(pos.y);
    }
  },

  // determines our content layout
  layoutIfNeeded: function () {
    if (this._needsContentLayout) {
      this._needsContentLayout = false;
      var width = this.get('width') || 0;
      if (width !== this._width) {
        this._contentDirty = true;
        this._width = width;
      }
      var elementWidth = this.get('elementWidth');
      if (elementWidth !== this._elementWidth) {
        this._contentDirty = true;
        this._elementWidth = elementWidth;
      }
      var rowHeight = this.get('rowHeight');
      if (rowHeight !== this._rowHeight) {
        this._contentDirty = true;
        this._rowHeight = rowHeight;
      }

      if (this._contentDirty) {
        this._contentDirty = false;
        this._needsRowsUpdate = true;
        this._contentLength = this.get('content.length');
        this._totalHeight = this._bin.height(this._width);

        // needs to be done on dIE
        this._updateScrollableHeight(this._totalHeight);

        // updates classNameBinding
        this.set('_isGrid', this._bin.isGrid(this._width));
      }
    }

    if (this._needsViewportLayout) {
      this._needsViewportLayout = false;
      var height = this.get('height') || 0;
      if (height !== this._height) {
        if (height > this._height) {
          this._needsRowsUpdate = true;
        }
        this._height = height;
      }

      var maxScrollTop = max(0, this._totalHeight - this._height);
      if (maxScrollTop !== this._maxScrollTop) {
        this._maxScrollTop = maxScrollTop;

        if (this.scrollTop > this._maxScrollTop) {
          this.scrollTop = this._scrollTo(this._maxScrollTop);
        }
      }
    }

    this.updateRowsIfNeeded();
  },

  _scrollContentTo: function(y) {
    if (this.scrollTop !== y) {
      this.scrollTop = y;
      this._needsRowsUpdate = true;
      this.updateRowsIfNeeded();
    }
  },

  updateRowsIfNeeded: function () {
    if (!this._needsRowsUpdate) {
      return;
    }
    this._needsRowsUpdate = false;
    var numberVisible = this._bin.numberVisibleWithin(this.scrollTop, this._width, this._height, true);
    var startingIndex = this._bin.visibleStartingIndex(this.scrollTop, this._width);

    var entry;
    var views = [];
    var viewMap = {};
    var priorViewMap = this._viewMap;

    for (var i=startingIndex, l=startingIndex+numberVisible; i<l; i++) {
      var content = this.get('content').objectAt(i);
      var position = this._bin.position(i, this._width);
      var key = contentKey(content);
      entry = priorViewMap[key];
      if (entry) {
        entry.updatePosition(i, position);
        viewMap[key] = entry;
        views.push(entry);
      } else {
        var type = this.itemViewForIndex(i);
        entry = new ViewEntry(key, content, type, i, position);
        viewMap[key] = entry;
        views.push(entry);
      }
    }

    var priorViews = this._views;
    for (i=0, l=priorViews.length; i<l; i++) {
      entry = priorViews[i];
      if (viewMap[entry.key]) {
        continue;
      }
      this.enqueueView(entry.typeKey, entry.view);
    }

    for (i=0, l=views.length; i<l; i++) {
      entry = views[i];
      if (entry.view) {
        continue;
      }
      entry.updateView( this.dequeueView(entry.typeKey, entry.type) );
    }

    this._viewMap = viewMap;
    this._views = views;
    this._numberVisible = numberVisible;
    this._startingIndex = startingIndex;
  },

  _updateScrollableHeight: Ember.K,

  _setupBin: function() {
    if (this.heightForIndex) {
      return this._setupShelfFirstBin();
    } else {
      return this._setupFixedGridBin();
    }
  },

  _setupShelfFirstBin: function() {
    set(this, '_isShelf', true);
    // detect which bin we need
    var bin = new Bin.ShelfFirst([], 0, 0);
    var list = this;

    bin.length = function() {
      return list._contentLength;
    };

    bin.widthAtIndex = function(index) {
      if (list.widthForIndex) {
        return validateDimension('width', list.widthForIndex(index));
      } else {
        return Infinity;
      }
    };

    bin.heightAtIndex = function(index) {
      return validateDimension('height', list.heightForIndex(index));
    };

    return bin;
  },

  _setupFixedGridBin: function() {
    set(this, '_isFixed', true);
    // detect which bin we need
    var bin = new Bin.FixedGrid([], 0, 0);
    var list = this;

    bin.length = function() {
      return list.get('content.length');
    };

    bin.widthAtIndex = function() {
      var ret = list._elementWidth;
      if (ret === undefined) {
         return ret;
      }
      return validateDimension('elementWidth', ret);
    };

    bin.heightAtIndex = function() {
      return validateDimension('rowHeight', list._rowHeight);
    };

    return bin;
  },

  // _addContentArrayObserver: Ember.beforeObserver(function() {
  //   addContentArrayObserver.call(this);
  // }, 'content'),

  /**
    Called on your view when it should push strings of HTML into a
    `Ember.RenderBuffer`.

    Adds a [div](https://developer.mozilla.org/en-US/docs/HTML/Element/div)
    with a required `ember-list-container` class.

    @method render
    @param {Ember.RenderBuffer} buffer The render buffer
  */
  render: function (buffer) {
    var element          = buffer.element();
    var dom              = buffer.dom;
    var container        = dom.createElement('div');

    container.className  = 'ember-list-container';
    element.appendChild(container);

    this._childViewsMorph = dom.appendMorph(container, container, null);

    return container;
  },

  height: Ember.computed(integer),
  width: Ember.computed(integer),
  rowHeight: Ember.computed(integer),
  elementWidth: Ember.computed(integer),

  /**
    @private

    Sets inline styles of the view:
    - height
    - width
    - position
    - overflow
    - -webkit-overflow
    - overflow-scrolling

    Called while attributes binding.

    @property {Ember.ComputedProperty} style
  */
  style: Ember.computed('height', 'width', function() {
    var height, width, style, css;

    height = get(this, 'height');
    width = get(this, 'width');
    css = get(this, 'css');

    style = '';

    if (height) {
      style += 'height:' + height + 'px;';
    }

    if (width)  {
      style += 'width:' + width  + 'px;';
    }

    for ( var rule in css ) {
      if (css.hasOwnProperty(rule)) {
        style += rule + ':' + css[rule] + ';';
      }
    }

    return Ember.String.htmlSafe(style);
  }),

  /**
    @private

    Performs visual scrolling. Is overridden in Ember.ListView.

    @method scrollTo
  */
  scrollTo: function(y) {
    throw new Error('must override to perform the visual scroll and effectively delegate to _scrollContentTo');
  },

  /**
    @private

    Internal method used to force scroll position

    @method scrollTo
  */
  _scrollTo: Ember.K,

  createChildView: function (_view) {
    return this._super(_view, this._itemViewProps || {});
  },

  destroy: function () {
    if (!this._super()) {
      return;
    }

    if (this._createdEmptyView) {
      this._createdEmptyView.destroy();
    }

    return this;
  }
});
