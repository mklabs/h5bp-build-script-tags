# h5bp script tags

* https://github.com/h5bp/html5-boilerplate/issues/831

> The JS concatenation stuff is sort of like that but hard-coded and
> limited. Maybe we could expand upon it and make the comments more
> obviously related to the build script and exist in discrete blocks.


* > Everything inside a "build block" would be minified, concatenated,
  and revved into the '[md5].site.css' filename based on the one that is
specified in the comment. You could use whatever name you want. And
anything @import-ed inside those stylesheets would be included too.

* > The 'css' part would be a label to attach specific customisations
  made from within the config file like the compression library used and
the output directory. So 'css' might specify to use YUI's compressor and
output to /publish/css/site.css. You might just have 1 for CSS and 1 for
JS, or maintain several different patterns.


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

## Example

This repo is maily an example.

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

      <!-- [[ build css site.css ]] -->
      <link rel="stylesheet" href="css/style.css">
      <!-- [[ endbuild ]] -->

      <!-- [[ build js head-scripts.js ]] -->
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

      <!-- [[ build js libs.js ]] -->
      <script defer src="js/libs/underscore-min.js"></script>
      <script defer src="js/libs/backbone-min.js"></script>
      <!-- [[ endbuild ]] -->

      <!-- [[ build js app.js ]] -->
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

    
