import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { Post } from "@prisma/client";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export default function Post(
	props: PropsWithChildren<{ post: Post; setPosts: Dispatch<SetStateAction<Post[]>> }>
) {
	async function edit() {
		try {
			await fetch(`${import.meta.env.VITE_API_URL}/api/post/${props.post.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: "edit",
				}),
			});
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`);
			const posts: Post[] = await response.json();
			props.setPosts(posts);
		} catch (error) {
			throw error;
		}
	}
	async function remove() {
		try {
			await fetch(`${import.meta.env.VITE_API_URL}/api/post/${props.post.id}`, {
				method: "DELETE",
			});
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`);
			const posts: Post[] = await response.json();
			props.setPosts(posts);
		} catch (error) {
			throw error;
		}
	}

	return (
		<Card>
			<CardBody>{props.children}</CardBody>
			<CardFooter className='justify-center gap-2'>
				<Button color="danger" onClick={remove}>
					削除
				</Button>
				<Button onClick={edit}>編集</Button>
			</CardFooter>
		</Card>
	);
}
