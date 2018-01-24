function counter(values, prop) {
  let result = {};
  for (const v of values) {
    const p = prop(v);
    result[p] = (result[p] || 0) + 1;
  }
  return result;
}

module.exports = counter;
