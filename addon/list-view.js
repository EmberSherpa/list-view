import Ember from 'ember';
import ListViewHelper from './list-view-helper';
import ListViewMixin from './list-view-mixin';

/**
  The `Ember.ListView` view class renders a
  [div](https://developer.mozilla.org/en/HTML/Element/div) HTML element,
  with `ember-list-view` class.

  The context of each item element within the `Ember.ListView` are populated
  from the objects in the `ListView`'s `content` property.

  ### `content` as an Array of Objects

  The simplest version of an `Ember.ListView` takes an array of object as its
  `content` property. The object will be used as the `context` each item element
  inside the rendered `div`.

  Example:

  ```javascript
  App.ContributorsRoute = Ember.Route.extend({
    model: function () {
      return [
        { name: 'Stefan Penner' },
        { name: 'Alex Navasardyan' },
        { name: 'Ray Cohen'}
      ];
    }
  });
  ```

  ```handlebars
  {{#ember-list items=contributors height=500 rowHeight=50}}
    {{name}}
  {{/ember-list}}
  ```

  Would result in the following HTML:

  ```html
   <div id="ember181" class="ember-view ember-list-view" style="height:500px;width:500px;position:relative;overflow:scroll;-webkit-overflow-scrolling:touch;overflow-scrolling:touch;">
    <div class="ember-list-container">
      <div id="ember186" class="ember-view ember-list-item-view" style="transform: translate(0px, 0px)">
        Stefan Penner
      </div>
      <div id="ember187" class="ember-view ember-list-item-view" style="transform: translate(0px, 50px">
        Alex Navasardyan
      </div>
      <div id="ember188" class="ember-view ember-list-item-view" style="transform: translate(0px, 100px)">
        Ray Cohen
      </div>
    </div>
  </div>
  ```

  By default `Ember.ListView` provides support for `height`,
  `rowHeight`, `width`, `elementWidth`, `scrollTop` parameters.

  Note, that `height` and `rowHeight` are required parameters.

  ```handlebars
  {{#ember-list items=this height=500 rowHeight=50}}
    {{name}}
  {{/ember-list}}
  ```

  If you would like to have multiple columns in your view layout, you can
  set `width` and `elementWidth` parameters respectively.

  ```handlebars
  {{#ember-list items=this height=500 rowHeight=50 width=500 elementWidth=80}}
    {{name}}
  {{/ember-list}}
  ```

  ### Extending `Ember.ListView`

  Example:

  ```handlebars
  {{view 'list-view' content=content}}

  <script type="text/x-handlebars" data-template-name="row_item">
    {{name}}
  </script>
  ```

  ```javascript
  App.ListView = Ember.ListView.extend({
    height: 500,
    width: 500,
    elementWidth: 80,
    rowHeight: 20,
    itemViewClass: Ember.ListItemView.extend({templateName: "row_item"})
  });
  ```

  @extends Ember.ContainerView
  @class ListView
  @namespace Ember
*/
export default Ember.ContainerView.extend(ListViewMixin, {
  css: {
    position: 'relative',
    overflow: 'auto',
    '-webkit-overflow-scrolling': 'touch',
    'overflow-scrolling': 'touch'
  },

  applyTransform: ListViewHelper.applyTransform,

  _scrollTo: function(scrollTop) {
    var element = this.element;
    if (element) {
      element.scrollTop = scrollTop;
      return element.scrollTop;
    }
    return scrollTop;
  },

  didInsertElement: function() {
    this._scroll = Ember.run.bind(this, this.scroll);
    Ember.$(this.element).on('scroll', this._scroll);
    this.layoutIfNeeded();
    this._updateScrollableHeight(this._totalHeight);
    this.scrollTop = this._scrollTo(this.scrollTop);
  },

  willDestroyElement: function() {
    Ember.$(this.element).off('scroll', this._scroll);
  },

  scroll: function () {
    if (this.element) {
      this._scrollContentTo(this.element.scrollTop);
    }
  },

  scrollTo: function(y) {
    this._scrollTo(y);
  },

  _updateScrollableHeight: function (height) {
    if (this.element) {
      this.$('.ember-list-container').height(height);
    }
  }
});
