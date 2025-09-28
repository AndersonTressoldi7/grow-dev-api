// src/routes/index.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController'; // <-- named export agora
import { UserController } from '../controllers/userController';
import { TweetController } from '../controllers/tweetController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// --- Rotas de Autenticação (públicas) ---
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// --- Rotas de Usuário (protegidas) ---
router.get('/users/:id', authMiddleware, UserController.getUser);
router.post('/users/:followingId/follow', authMiddleware, UserController.followUser);
router.delete('/users/:followingId/unfollow', authMiddleware, UserController.unfollowUser);

// --- Rotas de Tweet (protegidas) ---
router.post('/tweets', authMiddleware, TweetController.createTweet);
router.get('/feed', authMiddleware, TweetController.getFeed);
router.post('/tweets/:tweetId/like', authMiddleware, TweetController.likeTweet);
router.delete('/tweets/:tweetId/like', authMiddleware, TweetController.unlikeTweet);

export { router };
