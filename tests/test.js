
var dombuild = require('../'),
  fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf'),
  ncp = require('ncp').ncp,
  assert = require('assert'),
  dirname = path.resolve(__dirname, 'fixture/'),
  tmpdir = path.resolve(__dirname, 'build/');

assert.ok(dombuild, 'Should dombuild required returns something');

// change working dir for conveniency
process.chdir(__dirname);

// clean up previous build dir, and prepare a new fresh version
rimraf(tmpdir, function(err) {
  if(err) throw err;

  console.log('Deleted previous build dir...');
  console.log('Created new build dir...');

  ncp(dirname, tmpdir, function(err) {
    if(err) throw err;

    dombuild(['index.html', '404.html'], { dirname: tmpdir }, function(err) {
      assert.ifError(err);
      console.log('dom build done');
    });
  });

});
