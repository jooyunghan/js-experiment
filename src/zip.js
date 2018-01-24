function zip(as, bs) {
  return as.map((a, i) => [a, bs[i]]);
}

module.exports = zip;
