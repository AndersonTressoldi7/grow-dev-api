import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, username, email, password, profileImageUrl } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
      });

      if (existingUser) return res.status(409).json({ message: 'Usuário já existe.' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          profileImageUrl: profileImageUrl || null, // garante compatibilidade
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          profileImageUrl: true,
          createdAt: true,
        }
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ message: 'Credenciais inválidas.' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}
