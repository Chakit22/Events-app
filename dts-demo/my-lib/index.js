exports.greet = function greet(name) {
  const trimmedName = name.trim();
  const upperName = trimmedName.toUpperCase();
  const message = "Hello, " + upperName;

  return message;
};
