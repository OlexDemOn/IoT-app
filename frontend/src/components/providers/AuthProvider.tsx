import { type ReactNode, createContext, useCallback, useContext, useState } from "react";
import type { User } from "../../types/users";

export interface AuthContext {
	isAuthenticated: boolean;
	login: (UserObject: User) => void;
	logout: () => void;
	user: User | null;
}

const AuthContext = createContext<AuthContext | null>(null);

const StorageKey = "authorization";

function getStoredUser() {
	const stored = localStorage.getItem(StorageKey);
	if (stored) {
		return JSON.parse(stored);
	}
	return null;
}

function setStoredUser(UserObject: User | null) {
	if (UserObject) {
		localStorage.setItem(StorageKey, JSON.stringify(UserObject));
	} else {
		localStorage.removeItem(StorageKey);
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => getStoredUser());
	const isAuthenticated = !!user;

	const logout = useCallback(async () => {
		setStoredUser(null);
		setUser(null);
	}, []);

	const login = useCallback(async (UserObject: User) => {
		setStoredUser(UserObject);
		setUser(UserObject);
	}, []);

	return <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
}
