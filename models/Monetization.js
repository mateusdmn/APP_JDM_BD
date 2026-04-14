// models/Monetization.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Monetization = sequelize.define('Monetization', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome_plano: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Aqui resolve o Ativar/Inativar
    }
}, {
    tableName: 'monetizacoes'
});

module.exports = Monetization;