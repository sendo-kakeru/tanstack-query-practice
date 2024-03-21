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

  findAll() {
    return this.prisma.post.findMany();
  }

  findOne(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: {
        text: updatePostDto.text,
      },
    });
  }

  remove(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
  removeAll() {
    return this.prisma.post.deleteMany();
  }
}
