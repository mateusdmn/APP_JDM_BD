// services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const { UniqueConstraintError } = require('sequelize'); 

const JWT_SECRET = 'sua_chave_secreta_jwt_muito_segura'; 

// -------------------------------------------------------------------
// LÓGICA DE CADASTRO E LOGIN (Mantida)
// -------------------------------------------------------------------

exports.registerUser = async (name, email, password, cpf, phone, address) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        cpf,      
        phone,     
        edcadastrado: address 
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

    return { 
        token, 
        user: { id: newUser.id, name: newUser.name, email: newUser.email, cpf: newUser.cpf, phone: newUser.phone, edcadastrado: newUser.edcadastrado } 
    };
};

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

// -------------------------------------------------------------------
// NOVO: LÓGICA DE ATUALIZAÇÃO DE PERFIL (Persistência no BD)
// -------------------------------------------------------------------

exports.updateUserProfile = async (userId, updateData) => {
    const user = await User.findByPk(userId);
    if (!user) {
        return null;
    }

    // 1. Lógica de Alteração de Senha
    if (updateData.newPassword) {
        // Verifica a senha atual (obrigatório para mudar a senha)
        if (!updateData.currentPassword) {
            throw new Error('A senha atual é obrigatória para fazer a troca.');
        }
        const isCurrentPasswordCorrect = await bcrypt.compare(updateData.currentPassword, user.password);
        if (!isCurrentPasswordCorrect) {
            throw new Error('Senha atual incorreta');
        }
        // Se a senha estiver correta, faz o hash da nova senha e a insere
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.newPassword, salt);
    }

    // 2. Limpeza de dados temporários/sensíveis
    delete updateData.currentPassword;
    delete updateData.newPassword;
    delete updateData.id;
    delete updateData.cpf; // Não permite alterar CPF por esta rota

    // 3. Executa a atualização
    await user.update(updateData);

    // 4. Retorna o usuário atualizado (sem a senha, por segurança)
    const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'cpf', 'phone', 'edcadastrado']
    });
    
    return updatedUser;
};