import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { Post } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export default function Post(props: PropsWithChildren<{ post: Post }>) {
	const queryClient = useQueryClient();
	const editMutation = useMutation({
		mutationFn: async (editPost: Omit<Omit<Post, "createdAt">, "updatedAt">) => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${editPost.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: editPost.text,
				}),
			});
			return response.json();
		},
		onSuccess(editedPost) {
			const previousPosts = queryClient.getQueryData<Post[]>(["infinite-posts"]);
			if (previousPosts) {
				queryClient.setQueryData<Post[]>(
					["infinite-posts"],
					previousPosts.map((post) => (post.id === editedPost.id ? editedPost : post))
				);
			}
		},
		onError(error) {
			throw error;
		},
	});
	const deleteMutation = useMutation({
		mutationFn: async (postId: number) => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}`, {
				method: "DELETE",
			});
			return response.json();
			// return deletedPost;
		},
		onSuccess(_, postId) {
			const previousPosts = queryClient.getQueryData<Post[]>(["infinite-posts"]);
			if (previousPosts) {
				queryClient.setQueryData<Post[]>(
					["infinite-posts"],
					previousPosts.filter((post) => post.id !== postId)
				);
			}
		},
		onError(error) {
			throw error;
		},
	});

	return (
		<Card className="h-[50vh]" >
			<CardBody>{props.children}</CardBody>
			<CardFooter className="justify-center gap-2">
				<Button color="danger" onClick={() => deleteMutation.mutate(props.post.id)}>
					削除
				</Button>
				<Button onClick={() => editMutation.mutate({ id: props.post.id, text: "edit" })}>
					編集
				</Button>
			</CardFooter>
		</Card>
	);
}
