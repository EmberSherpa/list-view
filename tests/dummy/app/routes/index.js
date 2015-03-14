import Ember from 'ember';
import makeModel from '../utils/make-model';

var data1 = makeModel(100)();
var data2 = makeModel(10000, 'smallImages')();

var toggler = true;
export default Ember.Route.extend({
  model: function() {
    return data1;
  },
  actions: {
    changeData: function() {
      toggler = !toggler;
      this.controllerFor('index').set('model', toggler ? data1 :  data2);
    }
  }
});
