function HashMap() {
  this.map = {};
}

HashMap.prototype.put = function(key, value) {
  this.map[JSON.stringify(key)] = value;
};

HashMap.prototype.get = function(key) {
  return this.map[JSON.stringify(key)];
};

HashMap.prototype.has = function(key) {
  return JSON.stringify(key) in this.map;
};

module.exports = HashMap;
