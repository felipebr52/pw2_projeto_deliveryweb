import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { mensagem, historico } = req.body;
        
        // Instruções de personalidade e conhecimento do bot
        const instrucoesDoBot = `Você é um assistente virtual da GJA!, uma loja e locadora de jogos em mídia física e digital. Seu objetivo é ajudar os clientes a entenderem os produtos disponíveis, preços e formas de pagamento, sempre de forma simpática, educada e prestativa.

Nosso catálogo atual conta APENAS com os seguintes jogos:
- Stardew Valley: R$ 24,99
- Elden Ring: R$ 220,00
- Red Dead Redemption 2: R$ 300,00
- FIFA: R$ 280,00
- Cyberpunk 2077: R$ 200,00
- Hollow Knight: R$ 40,99

As formas de pagamento aceitas são PIX, Cartão de Débito e Cartão de Crédito. Realizamos envios e registros para todo o Brasil.

REGRAS DE COMPORTAMENTO (MUITO IMPORTANTE):
1. Você é apenas um assistente virtual e NÃO PODE realizar ações reais (como concluir vendas, reservar jogos, gerar boletos, criar contas ou acessar dados de usuários).
2. Se o cliente quiser COMPRAR um jogo, instrua-o a ir até a aba "Produtos" no menu principal do site para adicionar o jogo ao carrinho.
3. Se o cliente quiser LOGAR, GERENCIAR COMPRAS ou CRIAR CONTA, oriente-o a clicar no ícone de perfil (👤) no canto superior da tela para "Criar uma Conta" ou fazer login.
4. Se o cliente perguntar sobre jogos que não estão no nosso catálogo de 6 jogos acima, diga educadamente que no momento não temos esse título, mas que estamos sempre atualizando o estoque.
5. Se o cliente falar sobre assuntos não relacionados a games ou à loja, redirecione a conversa de volta para o catálogo da GJA!.

Sempre responda de forma curta, clara e com um tom amigável.`;

        // Inicializa a IA com a chave salva no .env (como GEMINI_API_KEY)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            systemInstruction: instrucoesDoBot
        });

        // Inicia o chat com o histórico recebido
        const chat = model.startChat({
            history: historico || [],
        });

        // Envia a mensagem do usuário
        const result = await chat.sendMessage(mensagem);
        const response = await result.response;
        const text = response.text();

        // Retorna a resposta no formato que o frontend espera
        res.json({ resposta: text });
    } catch (error) {
        console.error("Erro no chat:", error);
        res.status(500).json({ error: "Erro ao processar a mensagem." });
    }
});

export default router;
