import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return [
      {id:  1, type: "cat",   name: "Andrew"},
      {id:  5, type: "cat",   name: "Caroline"},
      {id:  2, type: "cat",   name: "Andrew"},
      {id:  3, type: "cat",   name: "Bruce"},
      {id:  5, type: "dog",   name: "Caroline"},
      {id:  6, type: "cat",   name: "David"},
      {id:  9, type: "dog",   name: "Edward"},
      {id: 10, type: "dog",   name: "Francis"},
      {id: 11, type: "dog",   name: "George"},
      {id: 13, type: "dog",   name: "Harry"},
      {id: 14, type: "cat",   name: "Ingrid"},
      {id: 16, type: "cat",   name: "Jenn"},
      {id: 17, type: "cat",   name: "Kelly"},
      {id: 20, type: "cat",   name: "Larry"},
      {id: 22, type: "cat",   name: "Manny"},
      {id: 23, type: "dog",   name: "Nathan"},
      {id: 24, type: "cat",   name: "Ophelia"},
      {id: 25, type: "dog",   name: "Patrick"},
      {id: 31, type: "cat",   name: "Quincy"},
      {id: 32, type: "dog",   name: "Roger"},
    ];
  }
});
