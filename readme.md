# h5bp script tags

jsdom/jquery + build script experiment.

This repository holds codes and test cases related to

* https://github.com/h5bp/html5-boilerplate/issues/831

**Status**: Ok for JS/CSS bundles/processor.

## Synopsis

    git clone git://github.com/mklabs/h5bp-build-script-tags.git
    cd h5bp-build-script-tags
    npm install
    npm start

A `[[ build js file.js ]]` directive is parsed as ``[[ build processor
path/to/bundle.js ]]`.

```console
$ npm start
npm info it worked if it ends with ok
npm info using npm@1.0.27
npm info using node@v0.4.12
npm info prestart h5bp-script-tags@0.0.1
npm info start h5bp-script-tags@0.0.1

> h5bp-script-tags@0.0.1 start /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags
> ./node_modules/.bin/h5bp-cake htmltags

verbose: start htmltags  »
verbose: start mkdirs  »
verbose: start clean  »
verbose: start intro  »
input:  intro »
Cool, let's start..
verbose: start check  »
input:  clean »  Cleaning up previous build directory...
info:   ✔ end:clean
input:  mkdirs »  Copying 9 files over to intermediate from .
info:   ✔ end:mkdirs
input:  htmltags »  Processing bundle: css/site.css with css processor
input:  htmltags »  Processing bundle: js/head-scripts.js with head processor
input:  htmltags »  Processing bundle: js/libs.js with js processor
input:  htmltags »  Processing bundle: js/app.js with js processor
input:  htmltags »  Init jquery.fs module
data:   {}
input:  htmltags »  Start of CSS processor
input:  htmltags »  Init jquery.fs module
data:   {}
input:  htmltags »  Start of JS processor, outputing without defer attribute
input:  htmltags »  Init jquery.fs module
data:   {}
input:  htmltags »  Start of JS processor
input:  htmltags »  Concat 1 file
input:  htmltags »  Concat file » js/libs/underscore-min.js to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/libs.js
input:  htmltags »  Concat file » js/libs/backbone-min.js to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/libs.js
input:  htmltags »  Write concat files to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/libs.js
input:  htmltags »  Concat/Min 1 file
input:  htmltags »  Minify file » js/libs/underscore-min.js
input:  htmltags »  Minify file » js/libs/backbone-min.js
input:  htmltags »  Write minified files to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/minified/stuff/with/a/long/path/js/libs.js
input:  htmltags »  Init jquery.fs module
data:   {}
input:  htmltags »  Start of JS processor
input:  htmltags »  Concat 1 file
input:  htmltags »  Concat file » js/plugins.js to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/app.js
input:  htmltags »  Concat file » js/script.js to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/app.js
input:  htmltags »  Write concat files to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/foobar/kkkjs/app.js
input:  htmltags »  Concat/Min 1 file
input:  htmltags »  Minify file » js/plugins.js
input:  htmltags »  Minify file » js/script.js
input:  htmltags »  Write minified files to /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/minified/stuff/with/a/long/path/js/app.js
input:  htmltags »  Rev concat css files ok css/site.css 988118e30102986f28cfcdb92eaf97db
input:  htmltags »  Processor done, replacing with <link rel="stylesheet" href="css/988118e30102986f28cfcdb92eaf97db.site.css">
input:  htmltags »  Processor done, replacing with <script src="js/873b6da0f0ac40656c83caee9ff03a54.head-scripts.js"></script>
input:  htmltags »  Processor done, replacing with <script defer src="js/e0c8abb7a5599a1caf8d00591d7691ff.libs.js"></script>
input:  htmltags »  Processor done, replacing with <script defer src="js/2b083070b5f0e6cd43aa8dd41e4401e4.app.js"></script>
input:  htmltags »  Update /Users/mk/Temp/dev/mklabs/h5bp-build-script-tags/intermediate/index.html with processed assets.
info:   ✔ end:htmltags
input:  htmltags »  File created » intermediate/foobar/kkkjs/libs.js
input:  htmltags »  File created » intermediate/foobar/kkkjs/app.js
input:  htmltags »  Minification ok js/app.js
input:  htmltags »  Minification ok js/libs.js
npm info poststart h5bp-script-tags@0.0.1
npm info ok
```


## Example

This repo is mainly an example.

...

## Processors

A processor might be everything. To create a processor, one would create
a new file in `tasks/processors`, name it appropriately, and implement
the processing function. Then it will be available to use in template
files, with the inine html comments.

        <!-- [[ build processorname output.ext ]] -->
          ... html markup ...
        <!-- [[ endbuild ]] -->

Html markup should be semantically valid, so that the html files could
be used in development. The processors must do their tasks based on the
html markup, it generally involves the parsing ot link/script tags.

You can checkout the tasks implementation in tasks/, these are the
plugins files that can interact with the main build script. And the
tasks/processors are the files inlvoded in handling the html markup,
they simply return the new html fragment.

## jsdom processors

*This is experimental..*

Here's the idea:

In the current implementation, processors takes html markup to do their
task.

This generally involves a lot of regex use. There is a great project
named [jsdom](https://github.com/tmpvar/jsdom) that would allow us to
think about a possible jquery usage in processors.

This is just fragment of html markup, so probably processors could use
jQuery to list whatever tags they want, and just use the jQuery syntax
to get the list of assets to process.

Then, we could probably extend the jQuery prototype and provides a few
helper methods to:

* easily do file concatenations
* minification
* revving of concataned scripts (probably before the min, saving the
  costly minification process when filename changes)
* write the resulting scripts, in the right place to comply with the
  overall build script.

Here is [a
start](https://github.com/mklabs/h5bp-build-script-tags/blob/master/tasks/processors/plugins/jquery.fs.js)
at some jQuery plugin helpers, wrapping up the node api in jQuery
methods then available to use in processors.

## Examples

### css

```js
var path = require('path');

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of CSS processor');

  $('link[href]').md5('intermediate/' + output, function(err, hash, file) {
    if(err) return em.emit('error', err);
    var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');

    em.emit('log', 'Rev concat css files ok ' + output + ' ' + hash);

    // clarfiy wheter callback/emitter is confusing, or just opt to use
    // the emitter, with a special replace event or something (not end,
    // already has semantic in build script)
    return cb(null, html, '<link rel="stylesheet href="' + href + '">');
  });
};
```

### js

```js
var path = require('path');

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of JS processor');

  // concat and minify here just for testing, the real use case is md5 and where
  // the callback call happen
  var scripts = $('script[src]').concat('intermediate/foobar/kkk' + output, function(err) {
    if(err) return em.emit('error', err);
    em.emit('log', 'File created » intermediate/foobar/kkk' + output);
  });

  // todo: handle dir/file arguments. When dir, should create with default name.
  scripts.minify('intermediate/minified/stuff/with/a/long/path/' + output, function(err) {
    if(err) return em.emit('error', err);
    em.emit('log', 'Minification ok ' + output);
  });

  $('script[src]').md5('./intermediate/' + output, function(err, hash) {
    if(err) return em.emit('error', err);
    var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
    return cb(null, html, '<script defer src="' + href + '"></script>');
  });
};
```


### index.html

Before:

```html
<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title></title>
  <meta name="description" content="">
  <meta name="author" content="">

  <meta name="viewport" content="width=device-width,initial-scale=1">

  <!-- [[ build css css/site.css ]] -->
  <link rel="stylesheet" href="css/style.css">
  <!-- [[ endbuild ]] -->

  <!-- [[ build js js/head-scripts.js ]] -->
  <script src="js/libs/modernizr-2.0.6.min.js"></script>
  <!-- [[ endbuild ]] -->
</head>

<body>

  <div id="container">
    <header>

    </header>
    <div id="main" role="main">

    </div>
    <footer>

    </footer>
  </div> <!--! end of #container -->


  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
  <script>window.jQuery || document.write('<script src="js/libs/jquery-1.6.2.min.js"><\/script>')</script>

  <!-- [[ build js js/libs.js ]] -->
  <script defer src="js/libs/underscore-min.js"></script>
  <script defer src="js/libs/backbone-min.js"></script>
  <!-- [[ endbuild ]] -->

  <!-- [[ build js js/app.js ]] -->
  <script defer src="js/plugins.js"></script>
  <script defer src="js/script.js"></script>

  <script> // Change UA-XXXXX-X to be your site's ID
    window._gaq = [['_setAccount','UAXXXXXXXX1'],['_trackPageview'],['_trackPageLoadTime']];
    Modernizr.load({
      load: ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js'
    });
  </script>
  <!-- [[ endbuild ]] -->

  <!--[if lt IE 7 ]>
    <script src="//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js"></script>
    <script>window.attachEvent('onload',function(){CFInstall.check({mode:'overlay'})})</script>
  <![endif]-->

</body>
</html>
```
After the `htmltags` task:

```html
<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title></title>
  <meta name="description" content="">
  <meta name="author" content="">

  <meta name="viewport" content="width=device-width,initial-scale=1">

<link rel="stylesheet" href="css/988118e30102986f28cfcdb92eaf97db.site.css">

<script src="js/873b6da0f0ac40656c83caee9ff03a54.head-scripts.js"></script>
</head>

<body>

  <div id="container">
    <header>

    </header>
    <div id="main" role="main">

    </div>
    <footer>

    </footer>
  </div> <!--! end of #container -->


  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
  <script>window.jQuery || document.write('<script src="js/libs/jquery-1.6.2.min.js"><\/script>')</script>

<script defer src="js/e0c8abb7a5599a1caf8d00591d7691ff.libs.js"></script>

<script defer src="js/d636120810e8c16e2229900bd71458f7.app.js"></script>

  <!--[if lt IE 7 ]>
    <script src="//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js"></script>
    <script>window.attachEvent('onload',function(){CFInstall.check({mode:'overlay'})})</script>
  <![endif]-->

</body>
</html>
```

## Generated files

are in `intermediate/` folder.
