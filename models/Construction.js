// models/Construction.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Importa a instância do Sequelize

const Construction = sequelize.define('Construction', {
    // ID será gerado automaticamente pelo Sequelize
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
   
    // NOVO CAMPO: Chave Estrangeira explícita (Corrigido na sugestão anterior)
    // Obras devem sempre estar vinculadas a um usuário.
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
   
    // Dados do Responsável
    cnpjCpf: {
        type: DataTypes.STRING,
        allowNull: false, // CNPJ/CPF é obrigatório
        unique: false,
    },
   
    // Nome e Local da Obra
    nomeObra: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    localObra: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   
    // CEP
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
   
    // NOVO CAMPO: Foto da Obra (CORRIGE o erro no ConstructionService)
    fotoObra: {
        type: DataTypes.STRING, // Armazenará o caminho ou URL
        allowNull: true,
    },

    // Status e Progresso da Obra
    status: {
        type: DataTypes.ENUM('Em Planejamento', 'Em Andamento', 'Concluída', 'Suspensa'),
        defaultValue: 'Em Planejamento',
    },
    progresso: {
        type: DataTypes.INTEGER, // Progresso em porcentagem (0 a 100)
        defaultValue: 0,
    },
   
}, {
    // Opções do Modelo
    tableName: 'constructions', // Nome da tabela no MySQL
    timestamps: true, // Adiciona createdAt e updatedAt
});

module.exports = Construction;