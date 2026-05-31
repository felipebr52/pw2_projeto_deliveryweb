
/*Imports*/
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import produtosRoute from './routes/produtosRoute.js';
import pedidosRoute from './routes/pedidosRoute.js';
import chatRoute from './routes/chatRoute.js';
import { conectarDB } from './configs/database.js';

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
/*Cors estava sendo usado para que a api não desse conflito com o dart/flutter na web, pois não tinha o emulador e usar o web é mais pratico. Sim, ele é inutil para um app flutter que supostamente rodaria nativamente num android ou qualquer mobile. COmo não é o caso, está sendo usado o cors*/
app.use(express.static("public"));

app.use('/api/produtos', produtosRoute);
app.use('/api/pedidos', pedidosRoute);
app.use('/chat', chatRoute);

app.get('/', (req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});
