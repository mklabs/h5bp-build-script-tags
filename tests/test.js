
var dombuild = require('../'),
  path = require('path'),
  exec = require('child_process').exec,
  assert = require('assert');

assert.ok(dombuild, 'Should dombuild required returns something');



// clean up previous build dir, and prepare a new fresh version

var cmds = [
  'rm -rf intermediate',
  'mkdir intermediate',
  'cp -vr index.html 404.html js/ css/ intermediate/'
].join(' && ');

exec(cmds, { cwd: path.join(__dirname, '..') }, function(err) {
  assert.ifError(err);
  console.log('Intermediate done');

  dombuild(['index.html', '404.html'], { dirname: path.join(__dirname, '../intermediate') }, function(err) {
    assert.ifError(err);

    console.log('dom build done');
  });

});

