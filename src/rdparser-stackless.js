const FAIL = {};

let _input;
let _pos;

function parse(input) {
  _input = input;
  _pos = 0;

  let stack = [parens()];
  let result;
  while (stack.length) {
    let parser = stack[stack.length - 1];
    const { value, done } = parser.next(result);
    if (done) {
      stack.pop();
      result = value;
    } else {
      stack.push(value);
      result = undefined;
    }
  }

  if (result === FAIL || _pos < _input.length) {
    throw new Error('parse error');
  }
  return result;
}

// parens = paren*
function* parens() {
  let result = [];
  while (true) {
    let s = yield paren();
    if (s === FAIL) break;
    result.push(s);
  }
  return result;
}

// paren = p1 | p2 | p3
function* paren() {
  let s;
  s = yield p1();
  if (s !== FAIL) {
    return s;
  }
  s = yield p2();
  if (s !== FAIL) {
    return s;
  }
  s = yield p3();
  return s;
}

// p1 = '(' parens ')'
function* p1() {
  let s;
  s = yield seq(char('('), parens(), char(')'));
  return s;
}

// p2 = '[' parens ']'
function* p2() {
  let s;
  s = yield seq(char('['), parens(), char(']'));
  return s;
}

function* seq(...ps) {
  let result = [];
  let p = _pos;
  while (ps.length) {
    const parser = ps.shift();
    let s = yield parser;
    if (s === FAIL) {
      _pos = p;
      return s;
    }
    result.push(s);
  }
  return result;
}

// p3 = '{' parens '}'
function* p3() {
  let s;
  s = yield seq(char('{'), parens(), char('}'));
  return s;
}

// char c
function* char(c) {
  throw new Error();
  if (_pos < _input.length && _input[_pos] === c) {
    _pos++;
    return c;
  }
  return FAIL; 
}

function long(nest) {
  let s = '';
  for (let i = 0; i < nest; i++) {
    s = '(' + s + ')';
  }
  return s;
}

console.log(parse(long(100000)));