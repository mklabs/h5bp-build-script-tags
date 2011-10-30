# h5bp script tags

jsdom/jquery + build script experiment.

This repository holds codes and test cases related to

* https://github.com/h5bp/html5-boilerplate/issues/831

**Status**: Ok for JS/CSS bundles/processor.

## Synopsis

    h5bp-cake htmltags

A `[[ build js file.js ]]` directive is parsed as ``[[ build processor
path/to/filename.js ]]`.

## Install

Get latest from dev branch (cake-bin):

    git clone mklabs/html5-boilerplate
    cd html5-boiletplate/
    git checkout -b cake-bin origin/cake-bin
    cd build/cake/
    npm link

Should install the package.json dependencies, and properly link the
`./bin/h5bp-cake` script so that you can call `h5bp-cake` from anywhere
on your system.

Then, you'll need to install the dependencies for the tasks in this
repository:

    git clone mklabs/h5bp-script-tags
    cd h5bp-script-tags
    npm install

## Example

This repo is mainly an example.

## Processors

A processor might be everything. There is now a valid JS processor, and the
skeleton for the CSS one. They simply follow similar patterns, where
they're used as `.replace()` handler.


    module.exports = function(file, lines) {
      console.log('CSS processor: ', file);
      console.log('content is', lines);

      // This is the curried replace function, the `match` is the
      // html markup within `[[ build css bundle.css]] ... [[ endbuild ]]`
      return function(match) {
        console.log('Replace for bundle', file);

        // do the processing here, and make sure to return the result.
        // todo: do the same as js blocks here

        // This is the place where you'd probably need to parse the
        // match value, looking for any stylesheets import, doing the
        // concat/min/reving/write, and returning the new `<link />`
        // to load the new reved css files.

        // To keep things simple, you could probably just use
        // synchronous implementation, since it's a one time hit.
        // Doing it async is definitely possible, but would require
        // a better defined api.

        return match;
      };
    };

To create a processor, one would create a new file in
`tasks/processors`, name it appropriately, and implement the processing
function. Then it will be available to use in template files, with the
inine html comments.

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

## Example

Check out the `tasks/processors` folder for real test case. Processors
could expose an async api, and further make use of jsdom to evaluate a
snippet of html markup.

    var EventEmitter = require('events').EventEmitter,
      jsdom = require('jsdom'),
      fs = require('fs'),
      path = require('path'),
      jquery = fs.readFileSync(path.join(__dirname, '..', 'support', 'jquery.js'), 'utf8');


    var processor = module.exports = function processor(file, content, output) {
      var em = new EventEmitter;

      jsdom.env({
        html: content,
        src: [jquery],
        done: function(err, window) {
          var $ = window.$;

          $('script[src]').each(function() {
            console.log(' » ', filename, $(this).attr('src'));
          });

          // Using an md5 plugin helper, concat and rev
          $('script[src]').md5('./intermediate/' + output, function(err, hash) {
            if(err) throw err;
            var href = output.split('/').slice(0, -1).concat(hash + '.' + path.basename(output)).join('/');
            em.emit('end', content, '<script defer src="' + href + '"></script>');
          });

        }
      });

      return em;
    };


## Output


    10:11 mklabs/h5bp-script-tags «v0.4.8/1.0.27»  (master)  » h5bp-cake htmltags
    verbose: start htmltags  »
    verbose: start mkdirs  »
    verbose: start clean  »
    verbose: start check  »
    input:  clean »  Cleaning up previous build directory...
    info:   ✔ end:clean
    input:  mkdirs »  Copying 14 files over to intermediate from .
    info:   ✔ end:mkdirs
    input:  htmltags »  Processing bundle: site.css with css css processor
    CSS processor:  site.css
    content is [ '  <!-- [[ build css site.css ]] -->',
      '  <link rel="stylesheet" href="css/style.css">',
      '  <!-- [[ endbuild ]] -->' ]
    Replace for bundle site.css
    input:  htmltags »  Processing bundle: head-scripts.js with js css processor
    JS processor:  head-scripts.js
    Replace for bundle head-scripts.js
    input:  htmltags »  Processing bundle: libs.js with js css processor
    JS processor:  libs.js
    Replace for bundle libs.js
    input:  htmltags »  Processing bundle: app.js with js css processor
    JS processor:  app.js
    Replace for bundle app.js
    info:   ✔ end:htmltags


### index.html

Before:

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

After the `htmltags` task:

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

      <link rel="stylesheet href="css/988118e30102986f28cfcdb92eaf97db.site.css">

      <script defer src="js/873b6da0f0ac40656c83caee9ff03a54.head-scripts.js"></script>
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



## Generated files

are in `intermediate/` folder.

There's more code to do on the CSS part but the basics are there.
