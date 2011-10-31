
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.



/* Author: 

*/


// https://raw.github.com/mishoo/UglifyJS/master/test/unit/compress/test/whitespace.js
// testing purpose
function id(a) {
  // Form-Feed
  // Vertical Tab
   // No-Break Space
  ᠎// Mongolian Vowel Separator
   // En quad
   // Em quad
   // En space
   // Em space
   // Three-Per-Em Space
   // Four-Per-Em Space
   // Six-Per-Em Space
   // Figure Space
   // Punctuation Space
   // Thin Space
   // Hair Space
   // Narrow No-Break Space
   // Medium Mathematical Space
  　// Ideographic Space
  return a;
}




















