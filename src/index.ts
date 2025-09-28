// src/index.ts
import 'dotenv/config';
import express from 'express';
import { prisma } from './prisma';   // <- named import (mesmo que acima)
import { router } from './routes';   // ajuste se seu router for default export

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Conectado ao banco (Prisma).');
  } catch (err) {
    console.error('Erro conectando ao banco:', err);
    // decide se encerra ou continua; por segurança, encerre:
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

start();
