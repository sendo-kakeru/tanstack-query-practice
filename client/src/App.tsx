import { Button } from "@nextui-org/react";
import { Post as PostType } from "@prisma/client";
import Post from "./components/Post";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { InfinitePostResponse } from "./types/type";

const take = 2;
export default function App() {
	const { ref, inView } = useInView();
	const queryClient = useQueryClient();
	const { data, error, fetchNextPage, hasNextPage, isSuccess, isLoading, isFetchingNextPage } =
		useInfiniteQuery<InfinitePostResponse>({
			queryKey: ["infinite-posts"],
			queryFn: async ({ pageParam }) => {
				const lastCursor = await pageParam;
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/post?take=${take}&last_cursor=${lastCursor}`
				);
				return response.json();
			},
			staleTime: 10 * 1000,
			initialPageParam: "",
			getNextPageParam: async (lastPage) => lastPage.meta.lastCursor,
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
			return response.json();
		},
		onSuccess(createdPost: PostType) {
			const previousPages = queryClient.getQueryData<InfiniteData<InfinitePostResponse>>([
				"infinite-posts",
			]);
			console.log(previousPages);
			if (previousPages) {
				queryClient.setQueryData<InfiniteData<InfinitePostResponse>>(["infinite-posts"], {
					pages: [
						{ ...previousPages.pages[0], data: [createdPost, ...previousPages.pages[0].data] },
						...previousPages.pages.slice(1),
					],
					pageParams: previousPages.pageParams,
				});
			}
		},
		onError(error) {
			throw error;
		},
	});
	async function create() {
		createMutation.mutate("create");
	}
	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, inView, fetchNextPage]);
	if (error) return <div className="mt-10">{"An error has occurred: " + error.message}</div>;
	return (
		<div className="flex flex-col items-center p-8 gap-4">
			<Button type="submit" color="primary" onClick={create}>
				作成
			</Button>
			<div className="flex flex-col gap-4">
				{isSuccess &&
					data?.pages.map((page) =>
						page.data.map((post, index) => {
							if (page.data.length === index + 1) {
								return (
									<div ref={ref} key={post.id}>
										<Post post={post}>
											<p>{post.id}</p>
											<b className="mx-auto text-xl">{post.text}</b>
										</Post>
									</div>
								);
							} else {
								return (
									<Post post={post} key={post.id}>
										<p>{post.id}</p>
										<b className="mx-auto text-xl">{post.text}</b>
									</Post>
								);
							}
						})
					)}
				{(isLoading || isFetchingNextPage) && <p className="mb-4">Loading...</p>}
			</div>
		</div>
	);
}
