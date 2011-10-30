
module.exports = function(file, lines) {
  console.log('CSS processor: ', file);
  console.log('content is', lines);
  return function(match) {
    console.log('Replace for bundle', file);

    // do the processing here, and make sure to return the result.
    // todo: do the same as js blocks here
    return match;
  };
};
