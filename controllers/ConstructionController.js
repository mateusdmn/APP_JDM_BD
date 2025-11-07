// controllers/ConstructionController.js
const ConstructionService = require('../services/ConstructionService');

class ConstructionController {
   
    // 1. Cadastro de Obra (POST /register)
    static async registerConstruction(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Usuário não autenticado.' });
            }

            const { cnpjCpf, nomeObra, localObra, cep, dataInicio, previsaoTermino, status, progresso } = req.body;
           
            const dataToCreate = { cnpjCpf, nomeObra, localObra, cep, dataInicio, previsaoTermino, status, progresso, userId };
           
            const newConstruction = await ConstructionService.createConstruction(dataToCreate);
           
            return res.status(201).json({
                message: 'Obra cadastrada com sucesso!',
                construction: newConstruction
            });

        } catch (error) {
            console.error('Erro ao cadastrar obra:', error);
            if (error.name === 'SequelizeValidationError' || error.message.includes('not null')) {
                return res.status(400).json({ message: 'Dados inválidos. Verifique se todos os campos obrigatórios foram preenchidos.' });
            }
            return res.status(500).json({ message: 'Erro interno no servidor ao cadastrar obra.' });
        }
    }

    // 2. Listagem de Obras (GET /list)
    static async listUserConstructions(req, res) {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Acesso negado. Por favor, faça login novamente.' });
        }

        try {
            const constructions = await ConstructionService.getConstructionsByUserId(userId);
           
            // É CRUCIAL retornar o array no campo 'constructions'
            return res.status(200).json({
                message: 'Obras listadas com sucesso!',
                constructions: constructions
            });

        } catch (error) {
            console.error("Erro no Controller ao listar obras:", error.message);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar obras.' });
        }
    }
   
    // 3. Buscar Obra por ID (GET /:id) - CHAVE PARA EDIÇÃO
    static async getConstructionById(req, res) {
        const userId = req.userId;
        const obraId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        try {
            const construction = await ConstructionService.getConstructionById(obraId, userId);

            if (!construction) {
                return res.status(404).json({ message: 'Obra não encontrada ou você não tem permissão para acessá-la.' });
            }

            // É CRUCIAL retornar o objeto no campo 'construction'
            return res.status(200).json({
                message: 'Obra encontrada com sucesso!',
                construction: construction
            });

        } catch (error) {
            console.error("Erro no Controller ao buscar obra por ID:", error);
            return res.status(500).json({ message: 'Erro interno do servidor ao buscar obra.' });
        }
    }
   
    // 4. Editar Obra (PUT /:id)
    static async updateConstruction(req, res) {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const obraId = req.params.id;
        const updateData = req.body;

        try {
            const updatedConstruction = await ConstructionService.updateConstruction(obraId, userId, updateData);

            if (!updatedConstruction) {
                return res.status(404).json({ message: 'Obra não encontrada ou você não tem permissão para editá-la.' });
            }

            return res.status(200).json({
                message: 'Obra atualizada com sucesso!',
                construction: updatedConstruction
            });

        } catch (error) {
            console.error("Erro no Controller ao editar obra:", error);
            if (error.name === 'SequelizeValidationError') {
                 return res.status(400).json({ message: error.errors[0].message || 'Dados de atualização inválidos.' });
            }
            return res.status(500).json({ message: 'Erro interno do servidor ao editar obra.' });
        }
    }
   
    // 5. Deletar Obra (DELETE /:id)
    static async deleteConstruction(req, res) {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }
       
        const obraId = req.params.id;

        try {
            const deletedRows = await ConstructionService.deleteConstruction(obraId, userId);
           
            if (deletedRows === 0) {
                return res.status(404).json({ message: 'Obra não encontrada ou você não tem permissão para deletá-la.' });
            }

            return res.status(200).json({ message: 'Obra deletada com sucesso.' });

        } catch (error) {
            console.error("Erro no Controller ao deletar obra:", error);
            return res.status(500).json({ message: 'Erro interno do servidor ao deletar obra.' });
        }
    }
}

module.exports = ConstructionController;