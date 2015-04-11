/* jshint node: true */
'use strict';

var path = require('path');

module.exports = {
  name: 'ember-list-view',
  treeForVendor: function() {
    var trees = ['vendor'];

    var pack = new this.Funnel(path.join('node_modules', 'layout-bin-packer'), {
      srcDir: '/',
      files: ['index.js'],
      destDir: '/',
      getDestinationPath: function(relativePath) {
        return 'pack.js'
      }
    });
    trees.push(pack);

    if (this.isDevelopingAddon()) {
      var klassy = new this.Funnel('bower_components', {
        srcDir: '/klassy/lib',
        files: ['klassy.js'],
        destDir: '/'
      });

      var emberTestHelpers = new this.Funnel('bower_components', {
        srcDir: '/ember-test-helpers/lib',
        include: [/.js$/],
        destDir: '/'
      });

      var es6EmberTestHelpers = new this.transpileModules(this.mergeTrees([klassy, emberTestHelpers]), {
        esperantoOptions: {
          _evilES3SafeReExports: true,
          strict: true
        }
      });

      var emberTestHelpersAMD = this.concatFiles(es6EmberTestHelpers, {
        inputFiles: ['**/*.js'],
        outputFile: '/ember-test-helpers.amd.js'
      });
      trees.push(emberTestHelpersAMD);

      var qunitModule = new this.Funnel('bower_components', {
        srcDir: '/ember-qunit-source/lib/ember-qunit',
        include: [/qunit-module.js$/],
        destDir: '/'
      });

      var es6QunitModule = new this.transpileModules(this.mergeTrees([klassy, qunitModule]), {
        esperantoOptions: {
          _evilES3SafeReExports: true,
          strict: true
        }
      });

      var qunitModuleAMD = this.concatFiles(es6QunitModule, {
        inputFiles: ['**/*.js'],
        outputFile: '/ember-qunit-module.amd.js'
      });
      trees.push(qunitModuleAMD);
    }

    return this.mergeTrees(trees);
  }
};
