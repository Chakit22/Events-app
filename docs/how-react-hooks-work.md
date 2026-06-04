# How React Hooks Work Under The Hood

This note explains the mental model behind React hooks using the same examples we discussed:

- `useState`
- `useMemo`
- `useCallback`
- the Fiber object
- the hook linked list
- update queues
- `setCnt(cnt + 1)` vs `setCnt(prev => prev + 1)`

The main idea:

> React stores hook data on the component's internal Fiber object. Each hook becomes one node in a linked list. React walks that list in the same order on every render.

## 1. The Fiber Object

A Fiber is React's internal object for one component or DOM element in the UI tree.

For this component:

```jsx
function Profile() {
  const [cnt, setCnt] = useState(0)

  const user = useMemo(() => {
    return { name: "Chakit", score: cnt }
  }, [cnt])

  const handleClick = useCallback(() => {
    console.log(user)
  }, [user])

  return <button onClick={handleClick}>{cnt}</button>
}
```

React creates a Fiber for `Profile`.

A simplified Fiber object looks like this:

```js
const fiber = {
  type: Profile,
  tag: FunctionComponent,

  pendingProps: {},
  memoizedProps: {},

  memoizedState: null,

  child: null,
  sibling: null,
  return: null,

  alternate: null,

  updateQueue: null,
  flags: 0,
  lanes: 0,

  stateNode: null
}
```

Important fields:

```txt
type
  The component function or DOM tag.
  Example: Profile or "div".

tag
  What kind of Fiber this is.
  Example: FunctionComponent, HostComponent, Fragment.

pendingProps
  New props React is about to render with.

memoizedProps
  Props from the last completed render.

memoizedState
  For function components, this points to the first hook in the hook linked list.

child
  First child Fiber.

sibling
  Next Fiber at the same level.

return
  Parent Fiber.

alternate
  The other version of this Fiber.
  React usually has a current tree and a work-in-progress tree.

updateQueue
  Pending updates/effects associated with this Fiber.

flags
  Work that must happen in the commit phase.
  Example: insert DOM, update DOM, remove DOM, run effects.

lanes
  Priority of pending work.

stateNode
  The real DOM node for DOM Fibers.
  Usually null for function components.
```

For hooks, the most important one is:

```txt
fiber.memoizedState
```

For function components, this does not mean "one state value." It means:

```txt
start of the hook linked list
```

## 2. The Hook Linked List

Each hook is stored as a hook object.

Simplified:

```js
const hook = {
  memoizedState: null,
  baseState: null,
  baseQueue: null,
  queue: null,
  next: null
}
```

Important fields:

```txt
memoizedState
  The hook's remembered data from the last completed render.

queue
  Pending updates for this hook.
  Mostly important for useState/useReducer.

next
  Pointer to the next hook in the linked list.
```

Using our component:

```jsx
function Profile() {
  const [cnt, setCnt] = useState(0)

  const user = useMemo(() => {
    return { name: "Chakit", score: cnt }
  }, [cnt])

  const handleClick = useCallback(() => {
    console.log(user)
  }, [user])
}
```

React stores the hooks like this:

```txt
Profile Fiber.memoizedState
  |
  v
Hook 1: useState
  next
    |
    v
Hook 2: useMemo
  next
    |
    v
Hook 3: useCallback
  next
    |
    v
  null
```

React does not store hooks by variable name.

It does not know:

```txt
cnt hook
user hook
handleClick hook
```

It only knows:

```txt
first hook
second hook
third hook
```

That is why hooks must always be called in the same order.

## 3. What `memoizedState` Stores

`memoizedState` stores different data depending on the hook.

For `useState`:

```jsx
const [cnt, setCnt] = useState(0)
```

The hook stores:

```txt
memoizedState: 0
```

For `useMemo`:

```jsx
const user = useMemo(() => ({ score: cnt }), [cnt])
```

The hook stores:

```txt
memoizedState: [cachedValue, deps]
```

Example:

```txt
memoizedState: [userObject1 { score: 0 }, [0]]
```

For `useCallback`:

```jsx
const handleClick = useCallback(() => {
  console.log(user)
}, [user])
```

The hook stores:

```txt
memoizedState: [cachedFunction, deps]
```

Example:

```txt
memoizedState: [functionObject1, [userObject1]]
```

## 4. Initial Render

On the first render:

```jsx
function Profile() {
  const [cnt, setCnt] = useState(0)

  const user = useMemo(() => {
    return { name: "Chakit", score: cnt }
  }, [cnt])

  const handleClick = useCallback(() => {
    console.log(user)
  }, [user])
}
```

React creates the hook list.

The first render values are:

```txt
cnt = 0
user = userObject1 { name: "Chakit", score: 0 }
handleClick = functionObject1
```

The hook linked list is:

```txt
Profile Fiber.memoizedState
  |
  v
Hook 1: useState
  memoizedState: 0
  queue: empty
  next
    |
    v
Hook 2: useMemo
  memoizedState: [userObject1 { score: 0 }, [0]]
  next
    |
    v
Hook 3: useCallback
  memoizedState: [functionObject1, [userObject1]]
  next: null
```

## 5. How Dependency Comparison Works

For hooks like:

```jsx
useMemo(fn, deps)
useCallback(fn, deps)
useEffect(fn, deps)
```

React compares the new dependency values with the previous dependency values.

It uses `Object.is`.

Simplified:

```js
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps == null) return false

  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(nextDeps[i], prevDeps[i])) {
      return false
    }
  }

  return true
}
```

React compares the items inside the dependency array, not the array object itself.

Example:

```jsx
useMemo(() => value, [cnt, user])
```

React compares:

```js
Object.is(previousCnt, nextCnt)
Object.is(previousUser, nextUser)
```

Primitive values compare by value:

```js
Object.is(1, 1) // true
Object.is("hi", "hi") // true
```

Objects, arrays, and functions compare by reference:

```js
Object.is({}, {}) // false
Object.is([], []) // false
Object.is(() => {}, () => {}) // false
```

So this creates a new object every render:

```jsx
const user = { name: "Chakit" }
```

But this points to the same object:

```js
const sameUser = user
Object.is(sameUser, user) // true
```

## 6. React.memo And Shallow Prop Comparison

`React.memo` uses the same basic comparison idea, but it compares component props instead of hook dependencies.

Example:

```jsx
const Child = React.memo(function Child({ user, onClick }) {
  console.log("Child rendered")
  return <button onClick={onClick}>{user.name}</button>
})
```

If the parent renders this:

```jsx
function Parent() {
  const user = { name: "Chakit" }

  const handleClick = () => {
    console.log(user)
  }

  return <Child user={user} onClick={handleClick} />
}
```

Every parent render creates:

```txt
new user object
new handleClick function
```

So `React.memo` compares:

```js
Object.is(previousProps.user, nextProps.user)
Object.is(previousProps.onClick, nextProps.onClick)
```

Both are false:

```js
Object.is({ name: "Chakit" }, { name: "Chakit" }) // false
Object.is(() => {}, () => {}) // false
```

So the memoized child renders again.

`React.memo` does a shallow prop comparison. That means it compares only the first level of props.

For primitive props:

```jsx
<Child name="Chakit" age={25} />
```

React compares:

```js
Object.is(previousProps.name, nextProps.name)
Object.is(previousProps.age, nextProps.age)
```

Those are true when the values are the same:

```js
Object.is("Chakit", "Chakit") // true
Object.is(25, 25) // true
```

For object props:

```jsx
<Child user={{ name: "Chakit" }} />
```

Every render creates a new object, so:

```js
Object.is(previousProps.user, nextProps.user) // false
```

React does not deeply compare:

```js
previousProps.user.name
nextProps.user.name
```

It only checks:

```js
previousProps.user
nextProps.user
```

So this re-renders:

```jsx
function Parent() {
  return <Child user={{ name: "Chakit" }} />
}
```

But this can avoid re-rendering:

```jsx
function Parent() {
  const user = useMemo(() => {
    return { name: "Chakit" }
  }, [])

  return <Child user={user} />
}
```

Now `user` keeps the same object reference:

```js
Object.is(previousProps.user, nextProps.user) // true
```

For function props, use `useCallback` when the function reference needs to stay stable:

```jsx
function Parent() {
  const user = useMemo(() => {
    return { name: "Chakit" }
  }, [])

  const handleClick = useCallback(() => {
    console.log(user)
  }, [user])

  return <Child user={user} onClick={handleClick} />
}
```

Now if `user` did not change:

```js
Object.is(previousProps.user, nextProps.user) // true
Object.is(previousProps.onClick, nextProps.onClick) // true
```

So `React.memo` can skip rendering `Child`.

Short version:

```txt
useMemo/useCallback/useEffect
  compare dependency array items

React.memo
  compares props

Both use Object.is-style shallow comparison
  primitives compare by value
  objects/functions/arrays compare by reference
```

## 7. Queue Updates

Every `useState` hook has its own update queue.

Example:

```jsx
function Profile() {
  const [cnt, setCnt] = useState(0)
  const [user, setUser] = useState({ name: "Chakit", age: 25 })
}
```

The hook linked list is:

```txt
Profile Fiber.memoizedState
  |
  v
Hook 1: useState for cnt
  memoizedState: 0
  queue: updates for setCnt
  next
    |
    v
Hook 2: useState for user
  memoizedState: { name: "Chakit", age: 25 }
  queue: updates for setUser
  next: null
```

The setters are connected to their own queues:

```txt
setCnt  -> Hook 1 queue
setUser -> Hook 2 queue
```

So if you call:

```js
setCnt(1)
setUser({ name: "Chakit", age: 26 })
```

React does not search from Hook 1 to find Hook 2 at setter-call time.

`setUser` already knows which queue it belongs to.

The queues become:

```txt
Hook 1 queue:
  replace state with 1

Hook 2 queue:
  replace state with { name: "Chakit", age: 26 }
```

During the next render, React walks the hook linked list in order:

```txt
Hook 1
  process Hook 1 queue

Hook 1.next -> Hook 2
  process Hook 2 queue

Hook 2.next -> null
  stop
```

## 8. Dry Run: `setCnt(cnt + 1)` And `setCnt(cnt + 2)`

Start from the initial render:

```txt
cnt = 0
user = userObject1 { score: 0 }
handleClick = functionObject1
```

Hook list:

```txt
Hook 1: useState
  memoizedState: 0
  queue: empty

Hook 2: useMemo
  memoizedState: [userObject1 { score: 0 }, [0]]

Hook 3: useCallback
  memoizedState: [functionObject1, [userObject1]]
```

Now an event handler runs:

```js
setCnt(cnt + 1)
setCnt(cnt + 2)
```

During this render, `cnt` is a snapshot:

```txt
cnt = 0
```

So JavaScript evaluates the expressions immediately:

```js
cnt + 1 // 1
cnt + 2 // 2
```

React receives:

```js
setCnt(1)
setCnt(2)
```

The queue becomes:

```txt
Hook 1 queue:
  replace state with 1
  replace state with 2
```

React renders again.

It starts with the previous state:

```js
state = 0
```

Then processes the queue:

```js
state = 1
state = 2
```

Final state:

```txt
cnt = 2
```

Hook 1 becomes:

```txt
Hook 1: useState
  memoizedState: 2
```

Now React reaches `useMemo`.

Previous `useMemo` data:

```txt
memoizedState: [userObject1 { score: 0 }, [0]]
```

New deps:

```txt
[2]
```

React compares:

```js
Object.is(0, 2) // false
```

The dependency changed, so React creates a new object:

```txt
userObject2 = { name: "Chakit", score: 2 }
```

Hook 2 becomes:

```txt
Hook 2: useMemo
  memoizedState: [userObject2 { score: 2 }, [2]]
```

Now React reaches `useCallback`.

Previous `useCallback` data:

```txt
memoizedState: [functionObject1, [userObject1]]
```

New deps:

```txt
[userObject2]
```

React compares:

```js
Object.is(userObject1, userObject2) // false
```

The dependency changed, so React stores a new function:

```txt
functionObject2
```

Hook 3 becomes:

```txt
Hook 3: useCallback
  memoizedState: [functionObject2, [userObject2]]
```

Final result:

```txt
cnt = 2
user = userObject2 { score: 2 }
handleClick = functionObject2
```

## 9. Dry Run: `setCnt(prev => prev + 1)` And `setCnt(prev => prev + 2)`

Start again from:

```txt
cnt = 0
user = userObject1 { score: 0 }
handleClick = functionObject1
```

Now the event handler runs:

```js
setCnt(prev => prev + 1)
setCnt(prev => prev + 2)
```

This time React receives updater functions, not final values.

The queue becomes:

```txt
Hook 1 queue:
  prev => prev + 1
  prev => prev + 2
```

React renders again.

It starts with:

```js
state = 0
```

Then processes the queue:

```js
state = state + 1
// state = 1

state = state + 2
// state = 3
```

Final state:

```txt
cnt = 3
```

Hook 1 becomes:

```txt
Hook 1: useState
  memoizedState: 3
```

Now React reaches `useMemo`.

Previous deps:

```txt
[0]
```

New deps:

```txt
[3]
```

React compares:

```js
Object.is(0, 3) // false
```

The dependency changed, so React creates:

```txt
userObject2 = { name: "Chakit", score: 3 }
```

Hook 2 becomes:

```txt
Hook 2: useMemo
  memoizedState: [userObject2 { score: 3 }, [3]]
```

Now React reaches `useCallback`.

Previous deps:

```txt
[userObject1]
```

New deps:

```txt
[userObject2]
```

React compares:

```js
Object.is(userObject1, userObject2) // false
```

So React stores:

```txt
functionObject2
```

Hook 3 becomes:

```txt
Hook 3: useCallback
  memoizedState: [functionObject2, [userObject2]]
```

Final result:

```txt
cnt = 3
user = userObject2 { score: 3 }
handleClick = functionObject2
```

## 10. Side-By-Side Result

Starting from:

```txt
cnt = 0
```

Direct value updates:

```js
setCnt(cnt + 1)
setCnt(cnt + 2)
```

Become:

```js
setCnt(1)
setCnt(2)
```

Final:

```txt
cnt = 2
```

Functional updates:

```js
setCnt(prev => prev + 1)
setCnt(prev => prev + 2)
```

Stay as functions in the queue.

Final:

```txt
cnt = 3
```

Why?

```txt
cnt is a snapshot from the current render.

setCnt(cnt + 1) uses the old snapshot immediately.
setCnt(prev => prev + 1) receives the latest queued state during queue processing.
```

## 11. What If The State Does Not Change?

Example:

```js
setCnt(prev => prev)
```

This update may be added to the queue.

React processes it:

```js
previous state = 0
new state = 0
```

Then React compares:

```js
Object.is(0, 0) // true
```

Since the state is the same, React can bail out of meaningful work.

There are two moments:

```txt
setter call
  create/queue an update
  React may also eagerly check if the next state is the same

next render
  process the queue
  compute the final state
  compare old state and new state with Object.is
  if same, bail out
```

So the update can exist, but React can still avoid committing a visible change if the final state is the same.

## 12. The Short Mental Model

```txt
Fiber
  React's internal record for a component.

fiber.memoizedState
  Points to the first hook.

hook.next
  Points to the next hook.

hook.queue
  Stores pending updates for that hook.

hook.memoizedState
  Stores remembered data for that hook.

useState memoizedState
  Latest state.

useMemo memoizedState
  [cached value, deps]

useCallback memoizedState
  [cached function, deps]

Dependency comparison
  React compares each dependency with Object.is.

State comparison
  React compares old state and new state with Object.is.

React.memo
  Shallowly compares props with Object.is.
```

The whole system is basically:

```txt
1. Call the component.
2. Walk the hook linked list in order.
3. For useState, process that hook's queue.
4. For useMemo/useCallback, compare dependencies.
5. Update each hook's memoizedState when needed.
6. Commit the result if something actually changed.
```
