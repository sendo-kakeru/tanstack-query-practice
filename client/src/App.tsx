import { Button } from "@nextui-org/react";
import { Post as PostType } from "@prisma/client";
import { useEffect, useState } from "react";
import Post from "./components/Post";

export default function App() {
	const [posts, setPosts] = useState<PostType[]>([]);
	async function create() {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: "create",
				}),
			});
			const post: PostType = await response.json();
			setPosts((prev) => [...prev, post]);
		} catch (error) {
			throw error;
		}
	}
	useEffect(() => {
		(async () => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`);
			const posts: PostType[] = await response.json();
			setPosts(posts);
		})();
	}, []);
	return (
		<div className="flex flex-col items-center p-8 gap-4">
			<Button type="submit" color="primary" onClick={create}>
				作成
			</Button>
			{/* <Button color="danger">全て削除</Button> */}
			<div className="flex flex-wrap gap-4">
				{posts.map((post) => (
					<Post post={post} setPosts={setPosts} key={post.id}>
						<p>{post.id}</p>
						<b className="mx-auto text-xl">{post.text}</b>
					</Post>
				))}
			</div>
		</div>
	);
}
