
/* Inicialização do DOM */
document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    inicializarCarrinho();

    const vitrine = document.getElementById("vitrine-jogos");
    if (vitrine) {
        carregarProdutos();
    }
});

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ---------------- se as funções foram verdadeiras, o menu de usuario aparece. ---------------- //
function verificarAutenticacao() {
    const dropdown = document.getElementById('user-dropdown');
    const avatar = document.getElementById('avatar-icon');
    
    if (dropdown && avatar) {
        avatar.innerText = '👤';
        dropdown.innerHTML = `
            <a href="pedidos.html">📦 Meus Pedidos</a>
            <a href="#" onclick="toggleCart()">🛒 Meu Carrinho</a>
        `;
    }
}

function toggleUserMenu(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('user-dropdown');
    const container = document.querySelector('.user-menu-container');
    if (dropdown && dropdown.classList.contains('show') && (!container || !container.contains(event.target))) {
        dropdown.classList.remove('show');
    }
});

// ---------------- CARRINHO LÓGICA ---------------- //
function inicializarCarrinho() {
    if (!document.getElementById('cart-floating-btn')) {
        const body = document.querySelector('body');
        
        const cartBtn = document.createElement('div');
        cartBtn.id = 'cart-floating-btn';
        cartBtn.className = 'cart-floating-btn';
        cartBtn.onclick = toggleCart;
        cartBtn.innerHTML = `🛒 <span class="cart-badge" id="cart-badge">0</span>`;
        body.appendChild(cartBtn);

        const cartPanel = document.createElement('div');
        cartPanel.id = 'cart-panel';
        cartPanel.className = 'cart-panel';
        cartPanel.innerHTML = `
            <div class="cart-header">
                <h2>Seu Carrinho</h2>
                <button class="cart-close" onclick="toggleCart()">×</button>
            </div>
            <div class="cart-items" id="cart-items">
                <!-- Itens injetados via JS -->
            </div>
            <div class="cart-footer">
                <h3>Total: <span id="cart-total">R$ 0,00</span></h3>
                <button class="btn-checkout" onclick="finalizarCompra()">Finalizar Compra</button>
            </div>
        `;
        body.appendChild(cartPanel);
    }
    atualizarCarrinhoUI();
}

function toggleCart() {
    const panel = document.getElementById('cart-panel');
    panel.classList.toggle('open');
}
// ---------------- CRUD do carrinho(adicionar,remover...) ---------------- //
function adicionarAoCarrinho(id, nome, valor) {
    const itemExistente = carrinho.find(i => i.produto_id === id);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({ produto_id: id, produto_nome: nome, preco_unitario: parseFloat(valor), quantidade: 1 });
    }
    salvarCarrinho();
    atualizarCarrinhoUI();
    
    const panel = document.getElementById('cart-panel');
    if (!panel.classList.contains('open')) toggleCart();
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(i => i.produto_id !== id);
    salvarCarrinho();
    atualizarCarrinhoUI();
}

function alterarQuantidade(id, delta) {
    const item = carrinho.find(i => i.produto_id === id);
    if (item) {
        item.quantidade += delta;
        if (item.quantidade <= 0) removerDoCarrinho(id);
    }
    salvarCarrinho();
    atualizarCarrinhoUI();
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function atualizarCarrinhoUI() {
    const badge = document.getElementById('cart-badge');
    const itemsContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    
    if (!badge || !itemsContainer || !totalSpan) return;

    badge.innerText = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    itemsContainer.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        itemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
        carrinho.forEach(item => {
            total += item.preco_unitario * item.quantidade;
            itemsContainer.innerHTML += `
                <div class="cart-item">
                    <div>
                        <h4>${item.produto_nome}</h4>
                        <p>R$ ${(item.preco_unitario).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button onclick="alterarQuantidade(${item.produto_id}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${item.produto_id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    }

    totalSpan.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

async function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    // Solicitar o nome do cliente para o pedido, caso ele não esteja loggado
    const nomeCliente = prompt("Digite seu nome para o pedido:");
    if (!nomeCliente) {
        alert("Nome é obrigatório para finalizar a compra.");
        return;
    }

    const total = carrinho.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);

    try {
        const response = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nomeCliente: nomeCliente,
                itens: carrinho,
                total: total
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Compra finalizada com sucesso!');
            carrinho = [];
            salvarCarrinho();
            window.location.href = `recibo.html?id=${data.pedido_id}`;
        } else {
            alert(data.error || 'Erro ao finalizar a compra.');
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao finalizar a compra.');
    }
}

// ---------------- PRODUTOS LÓGICA ---------------- //
async function carregarProdutos() {
    const vitrine = document.getElementById("vitrine-jogos");
    vitrine.innerHTML = "<p style='text-align:center; width:100%; font-size:1.2rem;'>Carregando produtos...</p>";
    
    try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Erro ao buscar produtos da API');
        
        const produtos = await response.json();
        renderizarVitrine(produtos);
    } catch (error) {
        console.error("Erro:", error);
        vitrine.innerHTML = "<p style='text-align:center; width:100%; color: #ff4d4d;'>Erro ao carregar os produtos.</p>";
    }
}

function renderizarVitrine(produtos) {
    const vitrine = document.getElementById("vitrine-jogos");
    vitrine.innerHTML = ""; 

    if (produtos.length === 0) {
        vitrine.innerHTML = "<p style='text-align:center; width:100%;'>Nenhum produto disponível.</p>";
        return;
    }
    // Para cada produto, cria um cartão com as informações e o botão de compra. O botão é habilitado ou desabilitado dependendo da disponibilidade do produto.
    produtos.forEach((jogo) => {
        const disponivel = jogo.produto_disponivel;
        const btnHtml = disponivel 
            ? `<button class="btn-comprar" onclick="adicionarAoCarrinho(${jogo.produto_id}, '${jogo.produto_nome}', ${jogo.produto_valor})" style="border:none; cursor:pointer;">Adicionar ao Carrinho</button>`
            : `<button class="btn-comprar" disabled style="background:#555; cursor:not-allowed;">Indisponível</button>`;

        let cartaoHTML = `
          <article class="cartao-jogo">
            <div class="cartao-img-container">
                <img src="${jogo.produto_imagem}" alt="${jogo.produto_nome}">
            </div>
            <div class="cartao-conteudo">
                <h3>${jogo.produto_nome}</h3>
                <p class="preco">R$ ${parseFloat(jogo.produto_valor).toFixed(2).replace('.', ',')}</p>
                ${btnHtml}
            </div>
          </article>
        `;
        vitrine.innerHTML += cartaoHTML;
    });
}
