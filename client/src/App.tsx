import { Button } from "@nextui-org/react";
import { Post as PostType } from "@prisma/client";
import Post from "./components/Post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function App() {
	const queryClient = useQueryClient();
	const { data: posts } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`);
			const posts: PostType[] = await response.json();
			return posts;
		},
		staleTime: 10 * 1000,
	});
	const createMutation = useMutation({
		mutationFn: async (text: string) => {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					text: text,
				}),
			});
			const createdPost: PostType = await response.json();
			return createdPost;
		},
		onSuccess(createdPost) {
			const previousPosts = queryClient.getQueryData<PostType[]>(["posts"]);
			if (previousPosts) {
				queryClient.setQueryData<PostType[]>(["posts"], [createdPost, ...previousPosts]);
			}
		},
		onError(error) {
      throw error
    },
	});
	async function create() {
		createMutation.mutate("create");
	}
	return (
		<div className="flex flex-col items-center p-8 gap-4">
			<Button type="submit" color="primary" onClick={create}>
				作成
			</Button>
			{/* <Button color="danger">全て削除</Button> */}
			<div className="flex flex-wrap gap-4">
				{posts?.map((post) => (
					// {queryClient.getQueryData<PostType[]>(["posts"])?.map((post) => (
					<Post post={post} key={post.id}>
						<p>{post.id}</p>
						<b className="mx-auto text-xl">{post.text}</b>
					</Post>
				))}
			</div>
		</div>
	);
}
