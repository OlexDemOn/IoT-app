import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/comparsion")({
	component: () => <div>Hello /_auth/production!</div>,
});
