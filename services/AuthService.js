// services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const { UniqueConstraintError } = require('sequelize'); 

// ATENÇÃO: Use uma chave secreta forte. Em produção, use uma variável de ambiente!
const JWT_SECRET = 'sua_chave_secreta_jwt_muito_segura'; 

// -------------------------------------------------------------------
// LÓGICA DE CADASTRO
// -------------------------------------------------------------------

// A função agora aceita 'address' no input do body, mas salva como 'edcadastrado'
exports.registerUser = async (name, email, password, cpf, phone, address) => {
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        cpf,       
        phone,     
        // Mapeia o campo de input 'address' para a coluna 'edcadastrado'
        edcadastrado: address 
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

    return { 
        token, 
        // Retorna o novo nome do campo
        user: { id: newUser.id, name: newUser.name, email: newUser.email, cpf: newUser.cpf, phone: newUser.phone, edcadastrado: newUser.edcadastrado } 
    };
};

// -------------------------------------------------------------------
// LÓGICA DE LOGIN (Mantida)
// -------------------------------------------------------------------

exports.authenticate = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return { 
        token, 
        user: { id: user.id, name: user.name, email: user.email }
    };
};