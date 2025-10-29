const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const express = require('express');

// =======================================================
// 1. CONFIGURAÇÕES E CONEXÃO DB
// =======================================================

// Importa a função de conexão e a instância do Sequelize
const { connectDB, sequelize } = require('./config/db'); 

// Tenta conectar ao banco de dados MySQL
connectDB(); 

// Importa os modelos (Obrigatoriamente após a conexão)
const User = require('./models/user'); 
const Construction = require('./models/Construction'); 

// =======================================================
// 2. ASSOCIAÇÕES DO SEQUELIZE (Relação entre tabelas)
// =======================================================

// Associações: Uma Obra pertence a um Usuário e um Usuário tem várias Obras
Construction.belongsTo(User, { foreignKey: 'userId' }); 
User.hasMany(Construction, { foreignKey: 'userId' });

// =======================================================
// 3. SINCRONIZAÇÃO E INICIALIZAÇÃO DO EXPRESS
// =======================================================

const app = express();
const PORT = 3000;

// Configura o Express para servir arquivos estáticos (Frontend: HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// CORS: Permite a comunicação do front-end com o back-end (essencial)
app.use(cors()); 

// BODY-PARSER: Processa dados JSON e URL-encoded (essencial para todas as requisições POST)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// =======================================================
// 4. DEFINIÇÃO DAS ROTAS DA API
// =======================================================

// Rota de teste simples
app.get('/', (req, res) => {
    res.send('Servidor JDM (Node.js/Express) Ativo e Conectado!');
});

// Importa o arquivo de rotas
const authRoutes = require('./authRoutes'); 
const constructionRoutes = require('./constructionRoutes'); 
// const materialRoutes = require('./materialRoutes'); 

// Usa as rotas de AUTENTICAÇÃO (Login e Cadastro)
app.use('/api/auth', authRoutes); 

// Usa as rotas de CADASTRO e LISTAGEM de OBRA
app.use('/api/construction', constructionRoutes);

// Se precisar das rotas de materiais depois, descomente:
// app.use('/api/materials', materialRoutes); 


// =======================================================
// 5. GARANTIA DE SINCRONIZAÇÃO E INÍCIO DO SERVIDOR
// =======================================================

async function forceSyncModels() {
    try {
        // Usa { alter: true } para adicionar as novas colunas (CPF, Telefone, Endereço)
        // sem deletar os dados existentes na tabela 'users'.
        await sequelize.sync({ alter: true });
        console.log("Modelos sincronizados (Colunas atualizadas com sucesso).");
    } catch (error) {
        console.error("Erro ao garantir a sincronização de modelos:", error);
    }
}

// Garante a sincronização final e inicia o listener
forceSyncModels().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta http://localhost:${PORT}`);
        console.log(`Acesse a aplicação em: http://localhost:${PORT}/index.html`);
    });
});