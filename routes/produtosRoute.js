import express from 'express';
import produtoController from '../controllers/produtoController.js';

const router = express.Router();

router.get('/', produtoController.buscarProdutos);

export default router;
