import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForView from '../helpers/module-for-view';
import {compile, generateContent, sortElementsByPosition, itemPositions} from '../helpers/helpers';

moduleForView('list-view', 'unit/num-of-child-views-for-viewport-test.js - numOfChildViewsForViewport', {});

var content = [];
for (var i = 0; i < 20; i++) {
  content[i] = {
    id: i
  };
}

test("computing the number of child views to create with scrollTop zero", function(assert) {
  var view;
  Ember.run(()=>{
    view = this.subject({
      height: 500,
      rowHeight: 50,
      content: Ember.A()
    });
  });

  assert.equal(view._numChildViewsForViewport(), 0);
});

test("computing the number of child views to create after when scroll down a bit", function(assert) {
  var view;
  Ember.run(()=>{
    view = this.subject({
      height: 500,
      rowHeight: 50,
      scrollTop: 51,
      content: Ember.A()
    });
  });

  assert.equal(view._numChildViewsForViewport(), 0);
});

test("computing the number of child views to create with scrollTop zero (With content)", function(assert) {
  var view;
  Ember.run(()=>{
    view = this.subject({
      height: 500,
      rowHeight: 50,
      content: Ember.A(content)
    });
  });

  assert.equal(view._numChildViewsForViewport(), 11);
});

test("computing the number of child views to create after when scroll down a bit (with content)", function(assert) {
  var view;
  Ember.run(()=>{
    view = this.subject({
      height: 500,
      rowHeight: 50,
      scrollTop: 51,
      content: Ember.A(content)
    });
  });

  assert.equal(view._numChildViewsForViewport(), 11);
});
