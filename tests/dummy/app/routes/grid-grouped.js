import Ember from 'ember';
import {data1, data2} from '../utils/fixtures';

var toggler = true;
export default Ember.Route.extend({
  model: function() {
    var content = [], entry;
    for (var i = 0; i < 10000; i++) {
      entry = data1[i % data1.length];
      entry = JSON.parse(JSON.stringify(entry));
      entry.id = i;
      entry.name = entry.name + (i+1);
      content.push(entry);
    }
    return content;
  },
  actions: {
    changeData: function() {
      toggler = !toggler;
      this.controllerFor('grid-grouped').set('model', toggler ? data1 : data2 );
    }
  }
});
