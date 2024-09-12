import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../components/providers/AuthProvider";
import { LogoTTPSC } from "../components/assets/icons/LogoTTPSC";
import type { User } from "../types/users";
import { sendLogin } from "../api/endpoints";

const fallback = "/" as const;

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		//@ts-ignore
		if (context.auth.isAuthenticated) {
			throw redirect({ to: fallback });
		}
	},
	component: Login,
});

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function Login() {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const auth = useAuth();
	const router = useRouter();
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		setIsPending(true);
		try {
			event.preventDefault();
			const data = new FormData(event.currentTarget);
			const email = data.get("email") as string;
			const password = data.get("password") as string;

			if (!email || !password) return;
			const response = (await sendLogin(email, password)) as User;
			auth.login(response);
			await router.invalidate();
			await sleep(100);
			await navigate({ to: fallback });
			setIsPending(false);
			console.log(auth.user?.group_name);
		} catch (error) {
			console.log(error);
			setIsPending(false);
			if (error instanceof Error) {
				setError(error.message);
			}
		}
	};

	return (
		<div className=" flex flex-col justify-center items-center h-screen w-screen">
			<div className=" flex flex-col items-center border-4 border-bg-200 bg-bg-200 rounded-lg w-2/6 min-w-64 flex-shrink py-4">
				<LogoTTPSC className="w-3/5 max-w-[300px] min-w-[240px] mb-5" />
				<div className=" text-5xl text-text-100 mt-2 font-montserrat">Login page</div>
				<div className=" text-text-100 text-lg w-3/4 pt-4 mt-5 font-montserrat">Please enter your account details</div>
				<form onSubmit={handleSubmit} className="dark-theme w-3/4">
					<div className=" flex flex-col p-2">
						<div className="dark-theme text-text-100 font-montserrat">Email</div>
						<input
							className=" bg-bg-300 rounded-lg p-2 text-text-100 font-montserrat"
							type="email"
							name="email"
							autoComplete="off"
							placeholder="Enter your email"
							required
						/>
						<div className="dark-theme text-text-100 pt-2 font-montserrat">Password</div>
						<input
							className=" bg-bg-300 rounded-lg p-2 text-text-100 font-montserrat"
							type="password"
							name="password"
							placeholder="Enter your password"
							required
						/>
						{error ? <p className="dark-theme text-red-600 font-montserrat">{error}</p> : <p className="h-6">{}</p>}
						{/* <TextField label="Password" type="password" name="password" required variant="outlined" /> */}
						<button
							className=" flex justify-center bg-primary-300 rounded-lg hover:bg-primary-200 active:bg-primary-100 text-text-100 mt-5 p-2 tracking-wider uppercase font-montserrat"
							type="submit"
							disabled={isPending}
						>
							Sign in
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
