# Iter

A library to make Javascript Iterators and Iterables reasonably useful

The idea is that I want to be able to do things like this:

```javascript
const collection = new Set([1, 2, 3, 4]);
Iter(collection)
  .map((f) => f * 2)
  .forEach(console.log);
```

and that should print out

```
1
4
9
16
```

Why is this what I want? Because LINQ was awesome (and C# is a truly excellent
language) and the fact that you don't actually have to first create an array
before you start doing useful things to the iterable is a very good thing.

Here's perhaps a more useful example:

```javascript
const aFilteredCollection = Iter.Range(0, 500000)
  .filter((f) => f.value < 3)
  .map((f) => ({ value: f, name: 'Less than 3' }));

// I still haven't done anything with that collection
// It's an Iter, which can be iterated over
console.log(aFilteredCollection);

// And this will create an array
const values = [...aFilteredCollection];

// This will walk the collection:
aFilteredCollection.forEach(console.log);
```

All this looks interesting, but I haven't done anything yet, just jotting down
ideas, because the linq.js thing I found looked pretty terrible...
