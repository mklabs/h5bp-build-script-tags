window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;var a=[].slice.call(arguments);(typeof console.log==="object"?log.apply.call(console.log,console,a):console.log.apply(console,a))}};
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());




/* Author: 

*/


// https://raw.github.com/mishoo/UglifyJS/master/test/unit/compress/test/whitespace.js
// testing purppose
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




















