// src/server.ts
import express from 'express';
import cors from 'cors';
// CORREÇÃO: Especifique o arquivo 'index' dentro da pasta routes
import { router } from './routes/index'; 

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

const port = process.env.PORT || 3333;

app.listen(port, () => {
    console.log(`Server is running on port ${port}! 🚀`);
});