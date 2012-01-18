var path = require('path'),
  fs = require('fs'),
  pathSplit = path.join('/');

// Quite simple: The below function takes a full dom environment loaded
// with jQuery (extended with fs helpers) with a document matching the
// file being processed.
//
// The goal here is to parse the document using jQuery and mess around
// with it... The resulting dom tree is then used to replace the
// original file.
//

module.exports = function($, config, cb) {

  console.log('Start of document processor, getting the whole document and messing with it');

  console.log('Loking for any tags with data-build attributes...');

  var tags = $('[data-build]');
  console.log('tags: ', tags.length);

  if(!tags.length) return cb();

  // ## <head />
  //
  // Replace here any stylesheets references, concat them, generate a
  // new md5 hash and writes to data-build output
  var bundles = {},
    links = false,
    scripts = false;

  $('head link[data-build]').each(function() {
    var target = $(this),
      build = target.attr('data-build'),
      href = target.attr('href'),
      bundle = bundles[build];

    bundles[build] = (bundle || []).concat({
      build: build,
      href: href
    });
  });


  // for each different bundle target
  var ln = Object.keys(bundles).length;

  Object.keys(bundles).forEach(function(bundle) {
    console.log('Processing bundle ', bundle, path.resolve(config.dirname, bundle));


    var tags = $('head link[data-build="' + bundle + '"]'),
      tagsLn = tags.length;

    // create the concat / revved file
    tags.md5(config.dirname, bundle, function(err, file) {
      if(err) return cb(err);

      console.log(file + ' generated.');

      // remove all except the last one
      tags.each(function(i, it) {
        var t = $(it);
        if(i !== tagsLn - 1) return t.remove();

        // update the remaining one with the generated hashed file.
        var href = [path.dirname(bundle), path.basename(file)].join('/');
        t.attr('href', href).removeAttr('data-build');

        if(--ln) return;
        links = true;

        next();
      });
    });
  });


  // ## <scripts />
  //
  // Lookup any data-build script tags, get the bundles destination and
  // generate a new revved concatenated script for each of these
  //

  // Figure out the different bundle output to handle
  var jsBundles = {};

  $('script[data-build]').each(function() {
    var target = $(this),
      src = target.attr('src'),
      build = target.attr('data-build'),
      bundle = jsBundles[build];

    jsBundles[build] = (bundle || []).concat({
      build: build,
      src: src
    });
  });


  // for each different bundle target
  var jsLn = Object.keys(jsBundles).length;

  Object.keys(jsBundles).forEach(function(bundle) {
    console.log('Processing bundle ', bundle);

    var tags = $('script[data-build="' + bundle + '"]'),
      tagsLn = tags.length;

    // create the concat / revved file
    tags.md5(config.dirname, bundle, function(err, file) {
      if(err) return cb(err);

      console.log(file + ' generated.');

      // remove all except the last one
       // remove all except the last one
      tags.each(function(i, it) {
        var t = $(it);
        if(i !== tagsLn - 1) return t.remove();

        // update the remaining one with the generated hashed file.
        var href = [path.dirname(bundle), path.basename(file)].join('/');
        t.attr('src', href).removeAttr('data-build');

        if(--jsLn) return;
        scripts = true;

        next();
      });
    });
  });

  function next() {
    if(!links || !scripts) return;
    cb();
  }
};
