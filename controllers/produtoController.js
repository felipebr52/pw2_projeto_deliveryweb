import produtoModel from "../models/produtoModel.js";
/*verifica as operações do model*/
const buscarProdutos = async (req, res) => {
    try {
        const produtos = await produtoModel.buscarProdutos();
        res.status(200).json(produtos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produtos. " + error.message });
    }
}

export default {
    buscarProdutos
}   

