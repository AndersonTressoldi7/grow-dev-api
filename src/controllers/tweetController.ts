// src/controllers/tweetController.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class TweetController {
  static async createTweet(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { content, replyToId } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'O conteúdo do tweet é obrigatório.' });
    }

    try {
      const tweet = await prisma.tweet.create({
        data: {
          content,
          authorId: userId,  // agora é garantido que seja string
          replyToId: replyToId ?? null,
        },
        include: { author: true, likes: true, replies: true } // opcional, ajuda no retorno
      });
      return res.status(201).json(tweet);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async getFeed(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    try {
      const following = await prisma.follows.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      });

      const followingIds = following.map(f => f.followingId);

      const feed = await prisma.tweet.findMany({
        where: {
          OR: [
            { authorId: userId },
            { authorId: { in: followingIds } }
          ]
        },
        include: { author: true, likes: true, replies: true },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(feed);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async likeTweet(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { tweetId } = req.params;
    if (!tweetId) return res.status(400).json({ message: 'TweetId é obrigatório.' });

    try {
      const like = await prisma.like.create({
        data: { userId, tweetId }
      });
      return res.status(201).json(like);
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'P2002') {
        return res.status(400).json({ message: 'Você já curtiu este tweet.' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async unlikeTweet(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { tweetId } = req.params;
    if (!tweetId) return res.status(400).json({ message: 'TweetId é obrigatório.' });

    try {
      await prisma.like.delete({
        where: { userId_tweetId: { userId, tweetId } } // Prisma espera campos obrigatórios
      });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}
