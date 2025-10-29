const Construction = require('../models/Construction');
const User = require('../models/user'); // Precisamos do Model User para fazer o Include
const { Op } = require('sequelize'); // Usado para consultas mais avançadas, se necessário

// --- Função de Cadastro (Mantenha a sua, com a adição do userId) ---
exports.registerConstruction = async (req, res) => {
    try {
        // O userId é injetado na requisição pelo authMiddleware
        const userId = req.userId; 
        
        // Dados da obra enviados pelo frontend
        const { cnpjCpf, nomeObra, localObra, cep, dataInicio, previsaoTermino } = req.body;
        
        // Cria a nova obra, associando o userId do usuário logado
        const newConstruction = await Construction.create({
            cnpjCpf,
            nomeObra,
            localObra,
            cep,
            dataInicio,
            previsaoTermino,
            userId // Associa a obra ao usuário logado
        });
        
        return res.status(201).json({ 
            message: 'Obra cadastrada com sucesso!', 
            construction: newConstruction 
        });

    } catch (error) {
        console.error('Erro ao cadastrar obra:', error);
        // Exemplo de erro de validação (se usar Sequelize validations)
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: 'Erro interno no servidor ao cadastrar obra.' });
    }
};


// --- NOVA FUNÇÃO DE LISTAGEM ---
exports.listConstructions = async (req, res) => {
    try {
        // Encontra todas as obras. O parâmetro 'include' faz a união (JOIN) com a tabela 'User'.
        const constructions = await Construction.findAll({
            // Include o modelo User, mas seleciona apenas os atributos 'id' e 'name'
            include: [{
                model: User,
                attributes: ['id', 'name'], // Exclui a senha e outros dados sensíveis
                as: 'User' // Deve corresponder ao alias se você definiu um na associação (opcional)
            }],
            // Ordena as obras pela data de criação
            order: [['createdAt', 'DESC']] 
        });

        // Mapeia o resultado para um formato mais limpo para o frontend
        const result = constructions.map(construction => ({
            id: construction.id,
            cnpjCpf: construction.cnpjCpf,
            nomeObra: construction.nomeObra,
            localObra: construction.localObra,
            cep: construction.cep,
            dataInicio: construction.dataInicio,
            previsaoTermino: construction.previsaoTermino,
            // Adiciona o nome do usuário que cadastrou!
            usuarioCadastro: construction.User ? construction.User.name : 'Usuário Desconhecido'
        }));

        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao listar obras:', error);
        return res.status(500).json({ message: 'Erro interno ao listar obras.' });
    }
};