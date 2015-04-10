import Ember from 'ember';
import {
  module,
  test
  } from 'qunit';
import startApp from '../helpers/start-app';

var application;

module('Acceptance: Collection Helper', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('collection helper renders list view', function(assert) {
  visit('/collection-helper');
  andThen(function() {
    assert.equal(currentURL(), '/collection-helper');
    assert.equal(find('.ember-list-item-view').length, 18, "18 rows are visible");
  });
});
