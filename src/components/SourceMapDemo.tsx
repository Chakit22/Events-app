type Guest = {
  name: string;
};

const formatGreeting = (guest: Guest) => {
  const trimmedName = guest.name.trim();
  const upperName = trimmedName.toUpperCase();
  const message = `Hello, ${upperName}`;

  return message;
};

export const SourceMapDemo = () => {
  const crashOnPurpose = () => {
    const brokenGuest = 123 as unknown as Guest;
    const greeting = formatGreeting(brokenGuest);

    console.log(greeting);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl">Source Map Demo</h1>
      <p className="max-w-xl text-center">
        Open browser DevTools, click the button, and check the error location.
        Source maps should point back to this TypeScript file.
      </p>
      <button
        className="rounded-lg border-2 border-solid border-gray-800 bg-blue-500 px-4 py-2 text-white"
        onClick={crashOnPurpose}
      >
        Crash on purpose
      </button>
    </main>
  );
};
