import { post } from "@prisma/client";
import { type MetaFunction } from "@remix-run/node";
import { FormEvent, useEffect, useState } from "react";


export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix SPA" },
		{ name: "description", content: "Welcome to Remix (SPA Mode)!" },
	];
};

export default function Index() {
	const [ posts, setPosts] = useState<post[]>([])
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		console.log(import.meta.env.VITE_API_URL);
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: "hello",
					// content: "aaaaaaa",
				}),
			});
			const result = await response.json();
			console.log(result);
		} catch (error) {
			console.log(error);
		}
	}
	useEffect(() => {
		(async () => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`);
			const result = await response.json();
			console.log(result);
		})();
	}, []);
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
			<form onSubmit={handleSubmit}>
				<button type="submit">submit</button>
			</form>
			
		</div>
	);
}
