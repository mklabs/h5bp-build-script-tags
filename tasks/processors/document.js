var path = require('path'),
fs = require('fs');

// Quite simple: The below function takes a full dom environment loaded
// with jQuery (extended with fs helpers) with a document matching the
// file being processed.
//
// The goal here is to parse the document using jQuery and mess around
// with it... The resulting dom tree is then used to replace the
// original file.
//

module.exports = function($, output, html, em, cb) {
  // this === em
  this.emit('log', 'Start of document processor, getting the whole document and messing with it');

  this.emit('Loking for any tags with data-build attributes...');

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
    var data = $(this).data(),
      href = this.href,
      bundle = bundles[data.build];

    bundles[data.build] = (bundle || []).concat({
      data: data,
      href: href
    });
  });

  // for each different bundle target
  var ln = Object.keys(bundles).length;
  Object.keys(bundles).forEach(function(bundle) {
    console.log('Processing bundle ', bundle);

    $('head link[data-build="' + bundle + '"]').md5('intermediate/' + bundle, function(err, hash, file) {
      if(err) return em.emit('error', err);

      em.emit('log', file + ' generated.');

      var tags = $('head').find('link[data-build="' + bundle + '"]'),
        last = tags.slice(-1);

      // remove all except the last one
      tags.slice(0, -1).remove();

      // update the remaining one with the generated hashed file.
      var href = bundle.split('/').slice(0, -1).concat(path.basename(file)).join('/');
      last
        .attr('href', href)
        .removeAttr('data-build');

      if(--ln) return;
      links = true;

      next();
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
    var src = this.src,
      data = $(this).data(),
      bundle = jsBundles[data.build];

    jsBundles[data.build] = (bundle || []).concat({
      data: data,
      src: src
    });
  });


  // for each different bundle target
  var jsLn = Object.keys(jsBundles).length;
  Object.keys(jsBundles).forEach(function(bundle) {
    console.log('Processing bundle ', bundle);
    var tags = $('script[data-build="' + bundle + '"]');

    tags
      .filter(function(){ return this.src; })
      .md5('intermediate/' + bundle, function(err, hash, file) {
        if(err) return em.emit('error', err);

        em.emit('log', file + ' generated.');

        var last = tags.slice(-1);

        // remove all except the last one
        tags.slice(0, -1).remove();

        // update the remaining one with the generated hashed file.
        var href = bundle.split('/').slice(0, -1).concat(path.basename(file)).join('/');
        last
          .attr('src', href)
          .removeAttr('data-build');


        if(--jsLn) return;
        scripts = true;
        next();
      });
  });




  function next() {
    if(!links || !scripts) return;
    cb();
  }
};
