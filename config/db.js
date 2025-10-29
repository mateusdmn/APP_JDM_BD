// config/db.js
const { Sequelize } = require('sequelize');

// A SENHA É O TERCEIRO PARÂMETRO DA INSTÂNCIA DO SEQUELIZE:
const sequelize = new Sequelize(
    'jdm_db',     // 1. Nome do Banco de Dados (que será criado)
    'root',       // 2. Usuário (o padrão é 'root')
    '75467546', // 3. <-- COLOQUE SUA SENHA AQUI
    {
        host: 'localhost',
        dialect: 'mysql',
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