import { createContext } from "react";

/** The shared "who is logged in" box. Read it with the useAuth() hook. */
export const AuthContext = createContext(null);
