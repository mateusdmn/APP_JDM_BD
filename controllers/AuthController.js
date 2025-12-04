// controllers/AuthController.js
const AuthService = require('../services/AuthService');
const User = require('../models/user');
const { UniqueConstraintError } = require('sequelize');

// Função de Cadastro (Mantida, com campos de perfil)
exports.register = async (req, res) => {
    try {
        const { name, email, password, cpf, phone, address } = req.body; 
        const user = await AuthService.registerUser(name, email, password, cpf, phone, address);
        return res.status(201).json(user);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            const field = error.errors[0].path; 
            const message = field === 'cpf' ? 'CPF já cadastrado.' : 'Email já cadastrado.';
            return res.status(409).json({ message }); 
        }
        if (error.message === 'Validation error') {
            return res.status(400).json({ message: 'Dados inválidos ou faltando.' });
        }
        console.error("Erro interno no cadastro:", error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// Função de Login (Mantida)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.authenticate(email, password);
        return res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// NOVO: Busca Dados do Perfil (GET)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            // Garante que a senha e outros dados sensíveis não sejam enviados
            attributes: ['id', 'name', 'email', 'cpf', 'phone', 'edcadastrado'] 
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// NOVO: Atualiza Dados do Perfil (PUT/PATCH - Persistência)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId; // ID obtido do Token
        const updateData = req.body;
        
        // Chama o serviço para atualizar
        const updatedUser = await AuthService.updateUserProfile(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado ou sem permissão para editar.' });
        }
        
        return res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUser
        });

    } catch (error) {
        // Se o email já estiver sendo usado por outro usuário
        if (error instanceof UniqueConstraintError) {
             return res.status(409).json({ message: 'Email já cadastrado para outro usuário.' });
        }
        if (error.message === 'Senha atual incorreta') {
             return res.status(401).json({ message: 'Senha atual incorreta.' });
        }
        console.error("Erro ao atualizar perfil:", error);
        return res.status(500).json({ message: 'Erro ao persistir dados do perfil.' });
    }
};