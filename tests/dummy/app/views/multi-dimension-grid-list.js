import Ember from 'ember';
import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';

export default ListView.extend({
  height: 300,
  width: 500,
  rowHeight: 100,
  paddingCount: 4,
  itemViews: {
    "cat" : ListItemView.extend({
      rowHeight: 100,
      width: 150,
      template: Ember.Handlebars.compile("<div {{bind-attr class='type :row'}}>Meow says {{name}} expected: cat === {{type}} {{id}}</div>")
    }),

    "dog" : ListItemView.extend({
      rowHeight: 50,
      width: Infinity,
      template: Ember.Handlebars.compile("<div {{bind-attr class='type :row'}}>Meow says {{name}} expected: cat === {{type}} {{id}}</div>")
    })
  },

  heightForIndex: function(idx) {
    var type = this.get('content').objectAt(idx).type;
    var height = type === 'dog' ? 50 : 150;
    return height;
  },

  widthForIndex: function(idx) {
    var type = this.get('content').objectAt(idx).type;
    var width = type === 'dog' ? Infinity : 150;
    return width;
  },

  itemViewForIndex: function(idx) {
    return this.itemViews[this.get('content').objectAt(idx).type];
  }
});
