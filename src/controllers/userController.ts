// src/controllers/userController.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma'; // ou './prisma' dependendo do caminho


export class UserController {
  static async getUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          tweets: true,
          followers: { include: { follower: true } },
          following: { include: { following: true } }
        }
      });

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async followUser(req: Request, res: Response) {
    const followerId = (req as any).userId as string | undefined;
    if (!followerId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { followingId } = req.params;
    if (followerId === followingId) {
      return res.status(400).json({ message: 'Usuário não pode seguir a si mesmo.' });
    }

    try {
      const follow = await prisma.follows.create({
        data: { followerId, followingId }
      });
      return res.status(201).json(follow);
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'P2002') {
        return res.status(400).json({ message: 'Você já segue este usuário.' });
      }
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async unfollowUser(req: Request, res: Response) {
    const followerId = (req as any).userId as string | undefined;
    if (!followerId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const { followingId } = req.params;

    try {
      await prisma.follows.delete({
        where: { followerId_followingId: { followerId, followingId } }
      });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}
