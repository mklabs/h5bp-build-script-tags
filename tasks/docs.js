
var path = require('path'),
fs = require('fs'),
exec = require('child_process').exec,
mkdirp = require('mkdirp'),
markdown = require('markdown'),
findit = require('findit'),
mustache = require('mustache'),
template = fs.readFileSync(path.join(__dirname, 'support', 'index.html'), 'utf8');

task('docs', 'Generates documention, based on the likely location of directories in your package.json', function(options, em) {

  em.emit('log', 'Doc start');

  var package = JSON.parse(fs.readFileSync(gimme(module, 'package.json', em), 'utf8'));

  var dirs = package.directories  = package.directories || {};
  // http://npmjs.org/doc/json.html#directories
  dirs.lib = dirs.lib || '';
  dirs.bin = dirs.bin || '';
  dirs.man = dirs.man || '';
  dirs.doc = dirs.doc || '';
  dirs.example = dirs.example || '';

  em
    .on('doc:lib', next.bind(em, 'lib'))
    .on('doc:doc', next.bind(em, 'doc'))

  mkdirp('docs', 0755, function(err) {
    if(err) return em.emit('error', err);
    docco(dirs, em);
    markdowns(dirs, package, em);
  })

  var remaining = 2;
  function next() {
    if(--remaining) return;
    em.emit('end');
  }
});




// ### Helpers

function gimme(pmodule, name, em, dir) {
  var dir = path.dirname(dir || pmodule.filename);

  var files = fs.readdirSync(dir);

  if (~files.indexOf(name)) {
    return path.join(dir, name);
  }

  if (dir === '/') {
    return em.emit('error', new Error('Could not find ' + name + ' up from: ' + dir));
  }

  return gimme(pmodule, name, em, dir);
}

function docco(dirs, em) {
  em.emit('log', 'Trying to generate documentation at the likely location of lib folder: ' + path.resolve(dirs.lib));

  if(!dirs.lib) {
    em.emit('warn', 'no dirs lib');
    return em.emit('doc:lib');
  }

  var files = [
    path.resolve(dirs.lib, '*.js') + ' ' + path.resolve(dirs.lib, '**/**.js')
  ].join(' ');

  exec('./node_modules/.bin/docco ' + files, function(err, stdout) {
    if(err) return em.emit('error', err);
    em.emit('log', stdout);
    em.emit('doc:lib');
  });
}

function markdowns(dirs, pkg, em) {
  em.emit('log', 'Trying to generate documentation at the likely location of doc folder: ' + path.resolve(dirs.doc));

  if(!dirs.doc) {
    em.emit('doc', 'no dirs doc');
    return em.emit('doc:doc');
  }

  var parts = pkg.repository.url.match(/git:\/\/github.com\/([a-z0-9_\-+=.]+)\/([a-z0-9_\-+=.]+).git/),
    username = parts && parts[1],
    repo = parts && parts[2];

  var source = path.resolve(dirs.doc),
  files = findit.findSync(source)
    .filter(function(it) {
      // you must be a file
      if(!fs.statSync(it).isFile()) return false;

      // you must be a markdown one
      if(!~['.mkd', '.md', '.markdown'].indexOf(path.extname(it))) return false;

      // also, are you in node_modules folder?
      if(/node_modules/.test(it)) return false;

      return true;
    })
    .map(function(it) {
      return {
        file: path.basename(it),
        path: it,
        content: fs.readFileSync(it, 'utf8')
      }
    });

  var remaining = files.length;
  files.forEach(function(mds) {
    em.emit('log', 'Generating from ' + mds.file);
    var html = markdown.parse(postparse(preparse(mds.content), username, repo, [username, repo].join('/')));

    pkg.content = html;
    pkg.docpath = pkg.config.doc;
    html = mustache.to_html(template, pkg, {});

    em.emit('log', 'Writing html page for ' + mds.path);
    em.emit('log', 'Creating folder structure for ' + path.dirname(output));

    // If that's a readme, and is at the root of the repo, write as index.html
    var output = new RegExp('readme', 'i').test(mds.file) && path.dirname(mds.path) === path.resolve() ? 'index.html' : mds.file,
    output = path.join(__dirname, '..', 'docs', path.dirname(mds.path.replace(source, '')), output);

    mkdirp(path.dirname(output), 0755, function(err) {
      if(err) return em.emit('error', err);
      em.emit('log', path.dirname(output) + ' created. Writing ' + mds.file);
      fs.writeFile(output.replace(/\..+/, '.html'), html, function(err) {
        if(err) return em.emit('errpr', err);
        em.emit('log', 'Ok for ' + mds.path);

        if(--remaining) return;
        em.emit('doc:doc');
      });
    });
  });

}


// handle ```js  kind of marker, remove them and indent code block with 4 spaces.
function preparse(file) {
  var lines = file.split('\n'),
    code = false,
    sections = [];

  lines = lines.map(function(line) {
    if(/^```\w+$/.test(line)) {
      code = true;
      return '';
    }

    if(/^```$/.test(line)) {
      code = false;
      return '';
    }

    var prefix = code ? new Array(8).join(' ') : '';
    return prefix + line;
  });

  return lines.join('\n');
}

// ok.. lame function name
function postparse(text, username, repoName, nameWithOwner) {
  // ** GFM **  Auto-link URLs
  text = text.replace(/https?\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!]/g, function(wholeMatch,matchIndex){
    var left = text.slice(0, matchIndex), right = text.slice(matchIndex)
    if (left.match(/<[^>]+$/) && right.match(/^[^>]*>/)) {return wholeMatch}
    href = wholeMatch.replace(/^http:\/\/github.com\//, "https://github.com/")
    return "[" + wholeMatch + "](" + wholeMatch + ")";
  });

  // ** GFM ** Auto-link sha1 if both name and repo are defined
  text = text.replace(/[a-f0-9]{40}/ig, function(wholeMatch,matchIndex) {
    if(!nameWithOwner) return wholeMatch;
    var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
    if (left.match(/@$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {return wholeMatch;}
    return "[" + wholeMatch.substring(0, 7) + "](http://github.com/" + nameWithOwner + "/commit/" + wholeMatch + ")";
  });

  // ** GFM ** Auto-link user/repo@sha1
  text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function(wholeMatch,repo,sha) {
    return "["+ repo + "@" + sha.substring(0,7) + "](http://github.com/" + repo + "/commit/" + sha + ")";
  });

  // ** GFM ** Auto-link #issue if nameWithOwner is defined
  text = text.replace(/#([0-9]+)/ig, function(wholeMatch,issue,matchIndex){
    if (!nameWithOwner) {return wholeMatch;}
    var left = text.slice(0, matchIndex), right = text.slice(matchIndex)
    if (left == "" || left.match(/[a-z0-9_\-+=.]$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) {return wholeMatch;}
    return "[" + wholeMatch + "](http://github.com/" + nameWithOwner + "/issues/#issue/" + issue + ")";
  });

  // ** GFM ** Auto-link user/repo#issue
  text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)#([0-9]+)/ig, function(wholeMatch,repo,issue){
    return "[" + wholeMatch + "](http://github.com/" + repo + "/issues/#issue/" + issue + ")";
  });

  return text;
}
