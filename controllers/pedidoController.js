import pedidoModel from "../models/pedidoModel.js";
/* verifica as operações do model para pedidos*/
const criarPedido = async (req, res) => {
    try {
        const { nomeCliente, total, itens } = req.body;
        if (!itens || itens.length === 0 || !total) {
            return res.status(400).json({ error: 'Dados do pedido incompletos.' });
        }
        const pedidoId = await pedidoModel.criarPedido(nomeCliente, total, itens);
        res.status(201).json({ message: 'Pedido finalizado com sucesso!', pedido_id: pedidoId });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao processar o pedido. ' + error.message });
    }
}

const buscarRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        const recibo = await pedidoModel.buscarPedidoPorId(id);
        if (!recibo) return res.status(404).json({ error: 'Pedido não encontrado.' });
        res.status(200).json(recibo);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar recibo. ' + error.message });
    }
}

const buscarTodosPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoModel.buscarTodosPedidos();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos. ' + error.message });
    }
}
/*exportando as funções*/
export default {
    criarPedido,
    buscarRecibo,
    buscarTodosPedidos
}
