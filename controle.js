const form = document.getElementById('form')
const descImput = document.querySelector('#descricao'); //outra opção de pegar
const valorImput = document.getElementById ('montante')
const balancoH1 = document.getElementById('balanco')
const receitaP = document.getElementById('din-positivo')
const despesaP = document.getElementById('din-negativo')
const transacoesUL = document.getElementById('transacoes')
const tipoTransacao = document.getElementById('tipo') //add tipo

// ls > Local Storage
const chave_transacoes_ls = `transacoes`
let transacoesSalvas;
try{
    transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_ls));
} catch(error){
    transacoesSalvas = null;
}
if (transacoesSalvas == null || transacoesSalvas == undefined){
    transacoesSalvas = []
}
    


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descTransacao = descImput.value.trim();
    const valorTransacao = valorImput.value.trim().replace(',', '.');
    const tipo = tipoTransacao.value; //add tipo

    //Fail fast - falhar cedo
    if ((descTransacao == "") || (valorTransacao == "")){
        alert('Descrição e valor não podem ser vazios')
        return;
    }

    let valor = parseFloat(valorTransacao);

    if (tipo === 'despesa') { //add tipo
        valor = -valor;
    }

    descImput.value = "";;
    valorImput.value = "";

    const transacao = {
        // ALTERAÇÃO: gera um ID começando em 0 e incrementando
        // sem repetir IDs após uma exclusão.
        id: gerarId(), //id: transacoesSalvas.length, id: parseInt(Math.random() * 1000), 
        
        descricao: descTransacao,

        // ALTERAÇÃO: utiliza a variável valor, que já foi
        // convertida para negativo caso seja uma despesa.
        valor: valor //add tipo
        //valor: parseFloat(valorTransacao)   
    }

    somaAoSaldo(transacao)
    somaReceitaDespesa(transacao)
    addTransacaoAoDom(transacao)

    transacoesSalvas.push(transacao)
    localStorage.setItem(chave_transacoes_ls, 
        JSON.stringify(transacoesSalvas))
});

function addTransacaoAoDom(transacao){
    //const operador = transacao.valor >= 0 ? '' : '-';
    const classCSS = transacao.valor >= 0 ? 'positivo' : 'negativo'

    const li = document.createElement(`li`)
    li.classList.add(classCSS)

    // ALTERAÇÃO: adiciona o ID da transação como
    // atributo data-* no elemento HTML.
    // Isso permite encontrar exatamente o <li> que deve ser excluído.
    li.dataset.id = transacao.id; //carregar automaticamente

    li.innerHTML = `${transacao.descricao}  
                    <span>${transacao.valor}</span>
                    <button onClick = "excluirTransacao(${transacao.id})"
                    class="delete-btn">X</button>`

    transacoesUL.append(li)

}

function somaReceitaDespesa(transacao){
    const elemento = transacao.valor > 0 ? receitaP : despesaP;
    const substituir = transacao.valor > 0 ? "+ R$" : "- R$";
    let valorAtual = elemento.innerHTML.replace(substituir, "")
    valorAtual = parseFloat(valorAtual)
    valorAtual += Math.abs(transacao.valor)
    elemento.innerHTML = `${substituir}${valorAtual.toFixed(2)}`
}

function somaAoSaldo(transacao){
    const valorTransacao = transacao.valor;

    let total = balancoH1.innerHTML.replace('R$','');
    total = parseFloat(total)
    total += valorTransacao;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`
}


function gerarId() { 
    // Cria a função para gerar o próximo ID.

    let maiorId = -1; 
    // Guarda o maior ID encontrado.

    for (let i = 0; i < transacoesSalvas.length; i++) { 
        // Percorre todas as transações.

        if (transacoesSalvas[i].id > maiorId) { 
            // Verifica se o ID atual é maior.

            maiorId = transacoesSalvas[i].id; 
            // Atualiza o maior ID.
        } 
    } 

    return maiorId + 1; 
    // Retorna o maior ID + 1.
}


function carregarDados(){
    transacoesUL.innerHTML = ''
    balancoH1.innerHTML = 'R$0.00'
    receitaP.innerHTML = '+ R$0.00'
    despesaP.innerHTML = '- R$0.00'

    for (let i = 0; i < transacoesSalvas.length; i++){
        somaAoSaldo(transacoesSalvas[i])
        somaReceitaDespesa(transacoesSalvas[i])
        addTransacaoAoDom(transacoesSalvas[i])
    }
}

carregarDados();


// ALTERAÇÃO: a exclusão agora remove somente a transação
// selecionada, sem chamar carregarDados().
//
// Antes:
// carregarDados()
//
// Agora:
// 1. encontra a transação pelo ID;
// 2. encontra o <li> correspondente;
// 3. remove somente esse <li> da tela;
// 4. remove a transação do array;
// 5. atualiza o Local Storage;
// 6. recalcula saldo, receitas e despesas.
function excluirTransacao(id){
    
    const transacaoIndex = transacoesSalvas.findIndex((transacao) =>
        transacao.id == id
    );

    // ALTERAÇÃO: verifica se a transação realmente existe.
    if (transacaoIndex === -1) {
        return;
    }

    // ALTERAÇÃO: encontra diretamente o <li> da transação
    // através do atributo data-id.
    const li = document.querySelector(`li[data-id="${id}"]`);

    // ALTERAÇÃO: remove somente o elemento clicado do DOM,
    // sem reconstruir toda a lista.
    if (li) {
        li.remove();
    }

    // Remove a transação do array.
    transacoesSalvas.splice(transacaoIndex,1)

    // Atualiza o Local Storage com o novo array.
    localStorage.setItem(chave_transacoes_ls,
        JSON.stringify(transacoesSalvas))
    
    // ALTERAÇÃO: recalcula somente os valores financeiros,
    // sem chamar carregarDados().
    recalcularValores()
    
};


// ALTERAÇÃO: recalcula o saldo, as receitas e as despesas
// depois que uma transação é excluída.
// A lista de transações não é recriada.
function recalcularValores(){

    balancoH1.innerHTML = 'R$0.00';
    receitaP.innerHTML = '+ R$0.00';
    despesaP.innerHTML = '- R$0.00';

    for (let i = 0; i < transacoesSalvas.length; i++){

        somaAoSaldo(transacoesSalvas[i]);
        somaReceitaDespesa(transacoesSalvas[i]);

    }
}