import { useEffect, useRef, useState } from "react";

export function RefCounterExample() {
  const [stateCount, setStateCount] = useState(0);
  const [openSearch, setOpenSearch] = useState(false);
  const refCount = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef2 = useRef<HTMLInputElement>(null);

  console.log("Component rendered");

  const incrementState = () => {
    setStateCount((prev) => prev + 1);
  };

  const incrementRef = () => {
    refCount.current += 1;
    console.log("refCount:", refCount.current);
  };

  const focusSearchInput = () => {
    // console.log(searchInputRef.current);
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [openSearch]);

  return (
    <div className="flex flex-col gap-6 border-4 border-black p-4 rounded-lg">
      <section className="flex flex-col gap-3">
        <h2>useRef Counter Example</h2>

        <p>State count: {stateCount}</p>

        <button
          className="p-2 border-2 border-black rounded-lg bg-blue-500"
          onClick={incrementState}
        >
          Increment state
        </button>

        <button
          className="p-2 border-2 border-black rounded-lg bg-green-500"
          onClick={incrementRef}
        >
          Increment ref
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Search Focus Example</h2>
        <input
          ref={searchInputRef}
          className="p-2 border-2 border-black rounded-lg"
          placeholder="Search events"
        />
        <button
          className="p-2 border-2 border-black rounded-lg bg-purple-500"
          onClick={focusSearchInput}
        >
          Focus search input
        </button>
      </section>

      <section className="flex flex-col gap-3">
        {openSearch && (
          <input
            ref={searchInputRef2}
            className="p-2 border-2 border-black rounded-lg"
            placeholder="Search events"
          />
        )}
        <button
          className="p-2 border-2 border-black rounded-lg bg-purple-500"
          onClick={() => {
            setOpenSearch((prev) => !prev);
          }}
        >
          Open Search
        </button>
      </section>
    </div>
  );
}
