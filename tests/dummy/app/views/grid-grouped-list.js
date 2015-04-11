import Ember from 'ember';
import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';

export default ListView.extend({
  /* TODO this API blows */
  itemViewForIndex: function(idx) {
    var ret = Ember.get(Ember.A(this.get('content')).objectAt(idx), 'width');

    return ret === null  || ret === Infinity ? Group : Item;
  },

  heightForIndex: function(idx) {
    var ret = Ember.get(Ember.A(this.get('content')).objectAt(idx), 'height');
    if (ret === null) {
      ret = Infinity;
    }
    return ret;
  },

  widthForIndex: function(idx) {
    var ret = Ember.get(Ember.A(this.get('content')).objectAt(idx), 'width');

    if (ret === null) {
      ret = Infinity; // Infinity doesn't JSON.stringify
    } else if (ret === undefined) {
      ret = this.get('elementWidth');
    }

    return ret;
  }
});

var Group = ListItemView.extend({
  classNames: ['grid-group']
});

var Item = ListItemView.extend({
  classNames: ['grid-item']
});
