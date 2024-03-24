import { Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(PostService.name);

  create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({ data: { text: createPostDto.text } });
  }
  async findAll(lastCursor?: number, take: number = 2) {
    try {
      const posts = await this.prisma.post.findMany({
        take,
        ...(lastCursor && {
          skip: 1,
          cursor: {
            id: lastCursor,
          },
        }),
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (posts.length === 0) {
        return {
          data: [],
          meta: {
            lastCursor: null,
            hasNextPage: false,
          },
        };
      }

      const cursor = posts[posts.length - 1].id;

      const nextPage = await this.prisma.post.findMany({
        take: take,
        skip: 1,
        cursor: {
          id: cursor,
        },
      });

      return {
        data: posts,
        meta: {
          lastCursor: cursor,
          hasNextPage: nextPage.length > 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  getCount() {
    return this.prisma.post.count();
  }
  findOne(id: number) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: {
        text: updatePostDto.text,
      },
    });
  }

  remove(id: number) {
    return this.prisma.post.delete({ where: { id } });
  }
  removeAll() {
    return this.prisma.post.deleteMany();
  }

  getCursorPost(lastCursor: number) {
    return this.prisma.post.findFirstOrThrow({
      where: {
        id: lastCursor,
      },
    });
  }
}
