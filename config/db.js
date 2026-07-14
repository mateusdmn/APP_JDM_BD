// config/db.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,       // Nome do Banco de Dados
    process.env.DB_USER,       // Usuário
    process.env.DB_PASSWORD,   // Senha
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        // Desativa logs de consulta para manter o console limpo
        logging: false, 
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Função para testar a conexão e sincronizar modelos
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL conectado com sucesso! Autenticação OK.');

        // Sincroniza todos os modelos (cria a tabela User se ela não existir)
        await sequelize.sync({ force: false }); 
        console.log('Tabelas sincronizadas (User criada, se necessário).');

    } catch (error) {
        // Este erro é o que você estava vendo (ECONNREFUSED)
        console.error('Erro ao conectar ou sincronizar o MySQL:', error);
        // O erro indica que o MySQL Server (Serviço) não está rodando.
        if (error.parent && error.parent.code === 'ECONNREFUSED') {
            console.error('ERRO: O Servidor MySQL (Windows Service) não está ativo ou a senha está incorreta.');
        }
    }
};

module.exports = { sequelize, connectDB };