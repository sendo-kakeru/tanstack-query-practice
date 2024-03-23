import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { Post } from "@prisma/client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
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
		onSuccess(editedPost: Post) {
			const previousPages = queryClient.getQueryData<InfiniteData<Post[]>>(["infinite-posts"]);
			if (previousPages) {
				queryClient.setQueryData<InfiniteData<Post[]>>(["infinite-posts"], {
					pages: previousPages.pages.map((page) =>
						page.map((post) => {
							if (editedPost.id === post.id) {
								return editedPost;
							}
							return post;
						})
					),
					pageParams: previousPages.pageParams,
				});
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
		},
		onSuccess(_, postId) {
			const previousPages = queryClient.getQueryData<InfiniteData<Post[]>>(["infinite-posts"]);
			if (previousPages) {
				queryClient.setQueryData<InfiniteData<Post[]>>(["infinite-posts"], {
					pages: previousPages.pages.map((page) => page.filter((post) => postId !== post.id)),
					pageParams: previousPages.pageParams,
				});
			}
		},
		onError(error) {
			throw error;
		},
	});

	return (
		<Card>
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
