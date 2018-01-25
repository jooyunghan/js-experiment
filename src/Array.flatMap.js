Array.prototype.flatMap = function ArrayFlatMap(f) {
  return this.reduce((a, b) => a.concat(f(b)), []);
};
