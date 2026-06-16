import debounce from "lodash/debounce";

const sayHello = () => {
  console.log("Hello");
};

debounce(sayHello, 300);
debounce("not a function", 300);
