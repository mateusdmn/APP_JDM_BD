const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const express = require('express');

// =======================================================
// 1. CONFIGURAÇÕES E CONEXÃO DB
// =======================================================
const { connectDB, sequelize } = require('./config/db'); 

// Tenta conectar ao banco de dados MySQL
connectDB(); 

// Importa os modelos (Obrigatoriamente após a conexão)
const User = require('./models/user'); 
const Construction = require('./models/Construction');
const Monetization = require('./models/Monetization'); 

// =======================================================
// 2. ASSOCIAÇÕES DO SEQUELIZE (Relação entre tabelas)
// =======================================================
Construction.belongsTo(User, { foreignKey: 'userId' }); 
User.hasMany(Construction, { foreignKey: 'userId' });

// =======================================================
// 3. INICIALIZAÇÃO DO EXPRESS
// =======================================================
const app = express();
const PORT = 3000;

// Configurações essenciais antes dos arquivos estáticos
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================================================
// 4. DEFINIÇÃO DAS ROTAS (ORDEM IMPORTANTE!)
// =======================================================

// AQUI ESTÁ O SEGREDO: Definimos a rota principal primeiro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Servir arquivos estáticos (CSS, JS, etc.) 
// O "{ index: false }" impede que o Express abra o index.html automaticamente na raiz
app.use(express.static(path.join(__dirname, '/'), { index: false }));

// Importa os arquivos de rotas da API
const authRoutes = require('./authRoutes'); 
const constructionRoutes = require('./constructionRoutes'); 

// Usa as rotas de API
app.use('/api/auth', authRoutes); 
app.use('/api/construction', constructionRoutes);
const monetizationRoutes = require('./monetizationRoutes');
app.use('/api/monetizacao', monetizationRoutes);

// =======================================================
// 5. GARANTIA DE SINCRONIZAÇÃO E INÍCIO DO SERVIDOR
// =======================================================
async function forceSyncModels() {
    try {
        // Usa { alter: true } para atualizar colunas sem deletar dados
        await sequelize.sync({ alter: true });
        console.log("MySQL: Tabelas e Colunas sincronizadas com sucesso.");
    } catch (error) {
        console.error("Erro ao garantir a sincronização de modelos:", error);
    }
}

// Inicia a sincronização e depois sobe o servidor
forceSyncModels().then(() => {
    app.listen(PORT, () => {
        console.log(`\n=================================================`);
        console.log(`🚀 SERVIDOR JDM ATIVO E ATUALIZADO`);
        console.log(`🔗 Landing Page: http://localhost:${PORT}`);
        console.log(`🔐 Tela de Login: http://localhost:${PORT}/index.html`);
        console.log(`=================================================\n`);
    });
});