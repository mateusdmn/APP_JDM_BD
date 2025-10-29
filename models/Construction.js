const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Importa a instância do Sequelize

const Construction = sequelize.define('Construction', {
    // ID será gerado automaticamente pelo Sequelize (UUID ou Integer)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    
    // Dados do Responsável (Exigido no formulário)
    cnpjCpf: {
        type: DataTypes.STRING,
        allowNull: false, // CNPJ/CPF é obrigatório
        unique: false,
    },
    
    // Nome e Local da Obra (Exigido no formulário)
    nomeObra: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    localObra: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    // CEP (Exigido no formulário)
    cep: {
        type: DataTypes.STRING(9), // Formato 00000-000
        allowNull: false,
    },
    
    // Datas de Início e Término
    dataInicio: {
        type: DataTypes.DATEONLY, // Apenas a data (AAAA-MM-DD)
        allowNull: false,
    },
    previsaoTermino: {
        type: DataTypes.DATEONLY,
        allowNull: true, // A previsão pode ser opcional
    },
    
    // Status e Progresso da Obra (Para gerenciamento futuro)
    status: {
        type: DataTypes.ENUM('Em Planejamento', 'Em Andamento', 'Concluída', 'Suspensa'),
        defaultValue: 'Em Planejamento',
    },
    progresso: {
        type: DataTypes.INTEGER, // Progresso em porcentagem (0 a 100)
        defaultValue: 0,
    },
    
    // Referência do Usuário (Quem cadastrou a obra)
    // O Sequelize vai adicionar automaticamente a coluna userId (CamelCase)
    // Isso será configurado no server.js através de uma associação (Passo 2)
    
}, {
    // Opções do Modelo
    tableName: 'constructions', // Nome da tabela no MySQL
    timestamps: true, // Adiciona createdAt e updatedAt
});

module.exports = Construction;