import { conectarDB } from "../configs/database.js";
// CRUD para pedidos
const criarPedido = async (nomeCliente, total, itens) => {
    const con = await conectarDB();
    try {
        await con.beginTransaction();
        const [pedidoResult] = await con.query(
            "INSERT INTO pedido (usuario_id, total, status) VALUES (?, ?, ?)", 
            [1, total, 'Recebido e em Processamento'] // Using 1 as a fallback for user_id to not break DB schema right now
        );
        const pedidoId = pedidoResult.insertId;
        
        for (let item of itens) {
            await con.query(
                "INSERT INTO pedido_item (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
            );
        }
        await con.commit();
        return pedidoId;
    } catch (error) {
        await con.rollback();
        throw error;
    }
}

const buscarPedidoPorId = async (id) => {
    const con = await conectarDB();
    const [pedidos] = await con.query("SELECT * FROM pedido WHERE id = ?", [id]);
    if (pedidos.length === 0) return null;
    
    const [itens] = await con.query(`
        SELECT pi.*, pr.produto_nome, pr.produto_imagem 
        FROM pedido_item pi 
        JOIN produto pr ON pi.produto_id = pr.produto_id 
        WHERE pi.pedido_id = ?
    `, [id]);
    
    return {
        pedido: pedidos[0],
        itens: itens
    };
}

const buscarTodosPedidos = async () => {
    const con = await conectarDB();
    const [pedidos] = await con.query("SELECT * FROM pedido ORDER BY data DESC");
    return pedidos;
}
// Exportando as funções para serem usadas em outros arquivos
export default {
    criarPedido,
    buscarPedidoPorId,
    buscarTodosPedidos
}
