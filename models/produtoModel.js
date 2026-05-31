import { conectarDB } from "../configs/database.js";
// busca os produtos dentro do banco de dados, através do database
const buscarProdutos = async () => {
    const con = await conectarDB();
    const [rows] = await con.query("SELECT * FROM produto");
    return rows;
}

export default {
    buscarProdutos
}        


