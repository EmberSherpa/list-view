import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'height',
    'width',
    'rowHeight',
    'itemCount',
    'elementWidth'
  ],
  height:    300,
  width:     500,
  rowHeight: 100,
  itemCount: 1000,
  maxItemCount: 99999,
  elementWidth: 100,
  items: Ember.computed('model.length', 'itemCount', function(key) {
    return this.get('model').slice(0, this.get('itemCount'));
  }).readOnly()
});
