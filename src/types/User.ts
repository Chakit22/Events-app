export interface User {
  id: string;
  name: string;
  phone: number;
  email: string;
  role: "admin" | "user";
}
