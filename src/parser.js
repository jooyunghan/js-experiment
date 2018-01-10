Array.prototype.flatMap = function flatMap(f) {
  const result = [];
  for (let x of this) {
    result.push(...f(x));
  }
  return result;
};
// Array.prototype.sequence = function sequence(M) {
//   if (this.length === 0) return M.pure([]);
//   return this[0].flatMap(x => this.slice(1).sequence(M).map(xs => [x, ...xs]));
// }

class Parser {
  constructor(runP) {
    this.runP = runP;
  }
  map(f) {
    return this.flatMap(x => Parser.pure(f(x)));
  }
  flatMap(f) {
    return new Parser(s => {
      return this.runP(s).flatMap(({ value, rest }) => f(value).runP(rest));
    });
  }
  static pure(v) {
    return new Parser(s => {
      return [
        {
          value: v,
          rest: s,
        },
      ];
    });
  }
  sat(pred) {
    return this.flatMap(x => (pred(x) ? Parser.pure(x) : Parser.never));
  }
  static char(c) {
    return Parser.item.sat(x => x === c);
  }
  seq(p) {
    return this.flatMap(a => p.map(b => [a, b]));
  }
  alt(p) {
    return new Parser(s => {
      const result = this.runP(s);
      if (result.length > 0) {
        return result;
      }
      return p.runP(s);
    });
  }
  many() {
    return this.many1().alt(Parser.pure([]));
  }
  many1() {
    return this.seq(Parser.defer(() => this.many())).map(([x, xs]) => [
      x,
      ...xs,
    ]);
  }
  static defer(pf) {
    return new Parser(s => {
      return pf().runP(s);
    });
  }
  wrap(p, s) {
    return Parser.char(p)
      .seq(this)
      .seq(Parser.char(s));
  }
}
Parser.item = new Parser(s => {
  if (s.length > 0) return [{ value: s[0], rest: s.slice(1) }];
  return [];
});
Parser.never = new Parser(s => []);

const parens = Parser.defer(() => paren).many();
const p1 = parens.wrap("(", ")");
const p2 = parens.wrap("[", "]");
const p3 = parens.wrap("{", "}");
const paren = p1.alt(p2).alt(p3);

function isValid(s) {
  for (const {value, rest} of parens.runP(s)) {
    if (rest === "") return true;
  }
  return false;
}

console.log(isValid("()[]{}()"));
console.log(isValid("[()]"));
console.log(isValid("[(][)]"));
console.log(isValid(require("../parser-input.json")));
