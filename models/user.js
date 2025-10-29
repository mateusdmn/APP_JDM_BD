// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true 
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // *** NOME DA COLUNA ALTERADO ***
    edcadastrado: {
        type: DataTypes.STRING,
        allowNull: true // Permite ser nulo
    }
    // ---------------------------------
}, {
    tableName: 'users' // Define o nome da tabela no banco
});

module.exports = User;