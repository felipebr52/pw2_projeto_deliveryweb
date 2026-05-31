import express from 'express';
import pedidoController from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/', pedidoController.criarPedido);
router.get('/', pedidoController.buscarTodosPedidos);
router.get('/recibo/:id', pedidoController.buscarRecibo);

export default router;
