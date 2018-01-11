function range(start, endExclusive) {
  const result = [];
  for (let i = start; i < endExclusive; i++) {
    result.push(i);
  }
  return result;
}

module.exports = range;
