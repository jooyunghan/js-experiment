/*
reduce는 Array 요소들을 결합하여 하나의 값을 만들 때 사용하는 요소다.
for 문으로 할 수 있는 대부분의 것들을 처리한다.

Haskell에서는 이렇게 하나의 값으로 환원시킬 수 있는 구조를
Foldable이라고 추상화했다.

즉, reduce 같은 연산자가 있다면 Foldable 구조라 한 것이다.

좀더 구체적으로는 foldMap 혹은 foldr 이라도 하는 함수가 정의되면 
그 구조는 Foldable이다.

JavaScript는 Array에 이미 reduce 메쏘드가 정의되어 있어서
Foldable이라고 할수 있다.

조금 확장해서 JavaScript 객체를 Foldable로 보고자 한다면 
여기에 맞게 reduce 혹은 foldMap/foldr 같은 함수를 정의하면 된다.

JavaScript 객체에 대해 foldMap을 구현해보자.

foldMap은 Monoid를 이용하여 해당 구조의 각 요소들을 결합하는 함수다.

여기서 Monoid는 zero 값과 plus 연산이 정의되는 값들을 말한다.
예를들어 문자열의 zero 값은 "" 이며, plus 연산은 a + b로 정의되므로 문자열은 Monoid다.
마찬가지로 a->a 타입의 함수의 zero값은 identity함수이며, plus 연산은 composition으로 정의되므로 
a->a 타입의 함수는 Monoid다.

Haskell의 foldMap 함수 타입을 보자.
  foldMap :: Monoid m => (a -> m) -> t a -> m

여기서 t에 해당하는 것이 JavaScript 객체를 나타내고 
JavaScript 객체로 표현된 어떤 트리 구조가 있고, 리프노드에 해당하는 값들(a)을 
어떤 Monoid로 변환하는 함수만 있으면 foldMap을 통해 단 하나의 값으로 환원할 수 있다.

Monoid는 zero값과 plus연산이 정의되었음을 의미하므로
JavaScript로 foldMap 함수를 정의할 때는 이 두 함수를 추가 인자로 받아야 한다.
*/

function foldMap(obj, toMonoid, zero, plus) {
  if (Array.isArray(obj)) {
    return obj.reduce(
      (a, b) => plus(a, foldMap(b, toMonoid, zero, plus)),
      zero
    );
  } else {
    return toMonoid(obj);
  }
}

// console.log(foldMap([1,2,4], x=>x, 0, (a,b) => a+b))
// console.log(foldMap([1,[2,4]], x=>x, 0, (a,b) => a+b))

/* 
객체의 경우는 value들만 뽑아서 배열처럼 처리하면 된다.
*/

function isObject(obj) {
  return obj.constructor === Object;
}

function foldMap(obj, toMonoid, zero, plus) {
  if (Array.isArray(obj)) {
    return obj.reduce(
      (a, b) => plus(a, foldMap(b, toMonoid, zero, plus)),
      zero
    );
  } else if (isObject(obj)) {
    return Object.values(obj).reduce(
      (a, b) => plus(a, foldMap(b, toMonoid, zero, plus)),
      zero
    );
  } else {
    return toMonoid(obj);
  }
}

// console.log(foldMap([1, 2, 4], x => x, 0, (a, b) => a + b));
// console.log(foldMap([1, [2, {a: 4}]], x => x, 0, (a, b) => a + b));

/*
foldMap이 정의되면 foldr은 foldMap으로 구현할 수 있다.
(반대로 할 수도 있다.)
*/

function foldr(obj, f, z) {
  return foldMap(obj, a => b => f(a, b), a => a, (f, g) => a => f(g(a)))(z);
}

// console.log(foldr([1, 2, 4], (a, b) => a + b, 0));
// console.log(foldr([1, [2, {a:4}]], (a, b) => a + b, 0));

/*
 이 구현에 사용된 Monoid는 앞서 예로 들었던 a->a 타입의 함수다.


Haskell의 Foldable 클래스는 몇가지 함수를 더 제공한다. 주로 리스트에 적용되는 연산을
Foldable로 일반화 한 것들이다.

* null - 비어있나?
* length - 요소들 갯수는?
* elem - 요소 포함 여부
* 그 밖에 maximum/minimum/sum/product/toList 등...

처음부터 Foldable 구조에 포함된 값이 Monoid인 경우에 적용할 수 있는 fold란 함수도 있다.

*/

function fold(obj, zero, plus) {
  return foldMap(obj, x => x, zero, plus);
}

/*
이왕 JavaScript 객체를 Foldable로 본다면 Functor로 취급하는 것도 가능하다.
Array의 map() 처럼 본래의 구조는 그대로 유지하면서 리프 값들에만 함수를 적용하면 된다.
*/

function map(obj, f) {
  if (Array.isArray(obj)) {
    return obj.map(a => map(a, f));
  } else if (isObject(obj)) {
    return Object.keys(obj).reduce(
      (a, b) => Object.assign(a, { [b]: map(obj[b], f) }),
      {}
    );
  } else {
    return f(obj);
  }
}

// console.log(map([1,{a:[4, 5]}], a => a + "!!!"))

/*

다음으로 살펴볼 함수는 Promise.all()과 관련되어 있다.
Promise.all()에 대응하는 Haskell 함수는 sequence다.
이 함수는 Traversable 클래스에 정의되어 있으며,
어떤 구조가 Traversable이라면 이는 해당 구조에 대해 어떤 효과를
적용하면서 값을 하나씩 따라갈 수 있다는 의미다.

Promise.all([p1, p2, p3]) 함수는 배열 구조 내부에 포함된 
Promise 효과를 모두 추출하여 하나의 Promise로 변환해준다.

Traversable 구조는 Foldable 이면서 Functor이기도 해야 한다.
JavaScript 객체를 Traversable로 보려면 sequence를 정의하면 된다.
여기선 임의의 효과 대신 Promise 효과에 국한하여 sequence를 정의해보자.

*/

function sequence(obj) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(sequence));
  } else if (isObject(obj)) {
    const keys = Object.keys(obj);
    return Promise.all(keys.map(k => sequence(obj[k]))).then(values =>
      zipObject(keys, values)
    );
  } else {
    return Promise.resolve(obj);
  }
}

function zipObject(keys, values) {
  return keys.reduce((a, b, i) => Object.assign(a, { [b]: values[i] }), {});
}

/*

Traversable 클래스는 원래 sequence 혹은 traverse 함수가 정의되면 된다.
이미 sequence 가 정의되었으면 traverse 를 구현할 수 있다.
sequence는 구조에 포함된 효과라면, traverse는 효과를 발생시키는 함수를 인자로 받아서
구조 안의 요소들에 하나씩 적용한다. map과 비슷한데, mapping 함수에 효과가 따라 붙는다.
*/

function traverse(obj, f) {
  return sequence(map(obj, f));
}

// traverse([1, {a: [4]}], a => Promise.resolve(a + "!")).then(console.log);

