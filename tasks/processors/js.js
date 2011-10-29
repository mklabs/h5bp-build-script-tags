
var regbuild = /^\s*<!--\s*\[\[\s*build\s(\w+)\s([\w\d\.-_]+)\s*\]\]\s*-->/,
  regend = /\s*<!--\s*\[\[\s*endbuild\s*\]\]\s*-->/,
  regscript = /\s*<script.+src=['"]*([\w\d\.\-_\/]+)['"]*\s*><\/script>/,
  path = require('path'),
  fs = require('fs'),
  crypto = require('crypto');

module.exports = function(file, lines) {
  console.log('JS processor: ', file);

  return function(match) {
    console.log('Replace for bundle', file);

    var lines = match.split('\n')
      // filter marker
      .filter(function(l) {
        return !(regbuild.test(l) || regend.test(l));
      });

    var scripts = lines.filter(function(l) {
      return regscript.test(l);
    }).map(function(l) {
      return fs.readFileSync(path.resolve(l.match(regscript)[1]), 'utf8');
    }).join('\n\n');

    var md5 = checksum(scripts);

    var destination  = path.join(__dirname, '..', '..', dir.intermediate),
    filename = path.join(destination, dir.js.main, md5 + '.' + file.replace(/\.js$/, '-concat.js'));
    fs.writeFileSync(filename, scripts);
    filename = filename.replace(destination, '');
    return '<script defer src="' + filename + '" ></script>';
  };
};

function checksum (file) {
  var md5 = crypto.createHash('md5');
  md5.update(file);
  return md5.digest('hex');
}
