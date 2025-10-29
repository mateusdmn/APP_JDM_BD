// controllers/AuthController.js
// Importa o Service, que contém a lógica de segurança e DB
const AuthService = require('../services/AuthService');
const { UniqueConstraintError } = require('sequelize'); // Importa o erro específico do Sequelize

// Função de Cadastro
exports.register = async (req, res) => {
    try {
        // Agora extrai TODOS os campos do body
        const { name, email, password, cpf, phone, address } = req.body; 
        
        // Chama o serviço para criar o usuário e retornar o token
        const user = await AuthService.registerUser(name, email, password, cpf, phone, address);
        
        return res.status(201).json(user);

    } catch (error) {
        // NOVO TRATAMENTO DE ERRO:
        // Se o erro for de unicidade (e-mail ou CPF já existe)
        if (error instanceof UniqueConstraintError) {
            // Analisa qual campo violou a restrição
            const field = error.errors[0].path; 
            const message = field === 'cpf' 
                ? 'CPF já cadastrado.' 
                : 'Email já cadastrado.';

            // Retorna o status 409 (Conflict) com a mensagem específica
            return res.status(409).json({ message }); 
        }
        
        // Tratamento de erro de credenciais (mantido por precaução)
        if (error.message === 'Validation error') {
            return res.status(400).json({ message: 'Dados inválidos ou faltando.' });
        }
        
        // Se for qualquer outro erro, retorna Erro Interno (500)
        console.error("Erro interno no cadastro:", error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// Função de Login (Mantida)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Chama o serviço para autenticar o usuário e retornar o token
        const result = await AuthService.authenticate(email, password);

        return res.status(200).json(result);

    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};