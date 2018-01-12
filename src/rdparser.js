

function Parens() {
  const FAIL = {};

  let _input;
  let _pos;

  function parse(input) {
    _input = input;
    _pos = 0;
    let s = start();
    return s;
  }

  // start = parens
  function start() {
    let s;
    s = parens();
    if (s === FAIL) {
      return undefined;
    }
    return s;
  }

  // parens = paren*
  function parens() {
    // console.log("parens", _pos)
    let result = [];
    while (true) {
      let s = paren();
      if (s === FAIL) break;
      result.push(s);
    }
    // console.log("parens =>", result)
    return result;
  }

  // paren = p1 | p2 | p3
  function paren() {
    // console.log("paren", _pos)
    let s;
    s = p1();
    if (s !== FAIL) {
      return s;
    }
    s = p2();
    if (s !== FAIL) {
      return s;
    }
    s = p3();
    return s;
  }

  // p1 = '(' parens ')'
  function p1() {
    // console.log("p1", _pos)
    let s = seq(() => char('('), parens, () => char(')'));
    // console.log("p1 =>", s)
    return s;
  }

  // p2 = '[' parens ']'
  function p2() {
    // console.log("p2", _pos)
    let s = seq(() => char('['), parens, () => char(']'));
    // console.log("p2 =>", s)
    return s
  }

  // p3 = '{' parens '}'
  function p3() {
    // console.log("p3", _pos)
    let s = seq(() => char('{'), parens, () => char('}'));
    // console.log("p3 =>", s)
    return s
  }

  // char c
  function char(c) {
    // console.log("char(", c, ")", _pos)
    if (_pos < _input.length && _input[_pos] === c) {
      _pos++;
      return c;
    }
    // console.log("char(", c, ") => FAIL")
    return FAIL;
  }

  function seq(...ps) {
    // console.log("seq", _pos)
    const result = [];
    let s;
    let p = _pos;
    while(ps.length) {
      s = ps.shift()()
      if (s === FAIL) {
        _pos = p;
        // console.log("seq => FAIL")
        return FAIL;
      }
      result.push(s);
    }
    // console.log("seq =>", result)
    return result;
  }

  return {
    parse
  };
}

const P = Parens();

function isValid(s) {
  return P.parse(s);
}

console.log(isValid("()[]{}()"));
console.log(isValid("[()]"));
console.log(isValid("[(][)]"));
console.log(isValid(require("../parser-input.json")));
