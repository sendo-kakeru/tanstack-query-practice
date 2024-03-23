import { Button } from "@nextui-org/react";
import { Post as PostType } from "@prisma/client";
import Post from "./components/Post";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function App() {
	const queryClient = useQueryClient();
	const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
		useInfiniteQuery<PostType[]>({
			queryKey: ["infinite-posts"],
			queryFn: async ({ pageParam }) => {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post?page=${pageParam}`);
				return response.json();
			},
			staleTime: 10 * 1000,
			initialPageParam: 0,
			getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
				console.log("getNextPageParam", lastPage, allPages, lastPageParam, allPageParams);
				return (lastPageParam as number) + 1;
			},
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
		mutationKey: ["infinite-posts"],
		onSuccess(createdPost: PostType) {
			const previousPages = queryClient.getQueryData<InfiniteData<PostType[]>>(["infinite-posts"]);
			if (previousPages) {
				queryClient.setQueryData<InfiniteData<PostType[]>>(["infinite-posts"], {
					pages: [[createdPost, ...previousPages.pages[0]], ...previousPages.pages.slice(1)],
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
	return (
		<div className="flex flex-col items-center p-8 gap-4">
			<Button type="submit" color="primary" onClick={create}>
				作成
			</Button>
			{/* <Button color="danger">全て削除</Button> */}
			<div className="flex flex-col gap-4">
				{status === "pending" ? (
					<p>Loading...</p>
				) : status === "error" ? (
					<p>Error: {error.message}</p>
				) : (
					<>
						{data.pages.map((page, index) => (
							<div className="shadow-2xl" key={index}>
								{page.map((post) => (
									<Post post={post} key={post.id}>
										<p>{post.id}</p>
										<b className="mx-auto text-xl">{post.text}</b>
									</Post>
								))}
							</div>
						))}
						{hasNextPage && (
							<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
								{isFetchingNextPage ? "Loading more..." : "Load More"}
							</button>
						)}
						{isFetching && !isFetchingNextPage && <p>Fetching more...</p>}
					</>
				)}
			</div>
		</div>
	);
}
