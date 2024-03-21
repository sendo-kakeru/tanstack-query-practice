import { Button, Card, CardBody } from "@nextui-org/react";
import { Post } from "@prisma/client";
import { FormEvent, useEffect, useState } from "react";

export default function App() {
	const [posts, setPosts] = useState<Post[]>([]);
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
				}),
			});
			const post: Post = await response.json();
			setPosts((prev) => [...prev, post]);
		} catch (error) {
			throw error;
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
				<Button type="submit">submit</Button>
			</form>
			<div className="flex flex-wrap">
				{posts.map((post) => (
					<Card key={post.id}>
						<CardBody>{post.text}</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}
