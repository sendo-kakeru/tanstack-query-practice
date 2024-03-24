import { Post } from "@prisma/client";

export type InfinitePostResponse = {
    data: Post[];
    meta: {
        lastCursor: number;
        hasNextPage: boolean;
    };
}