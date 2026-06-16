export const Box = ({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) => {
  console.log(children);
  console.log(message);
  return <div>Box</div>;
};
