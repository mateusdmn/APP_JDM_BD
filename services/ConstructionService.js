 // services/ConstructionService.js
const Construction = require('../models/Construction');

class ConstructionService {
   
    // 1. FUNÇÃO DE LISTAGEM
    static async getConstructionsByUserId(userId) {
        try {
            const constructions = await Construction.findAll({
                where: { userId: userId },
                order: [['dataInicio', 'DESC']],
                attributes: ['id', 'cnpjCpf', 'nomeObra', 'localObra', 'cep', 'dataInicio', 'previsaoTermino', 'fotoObra', 'status', 'progresso']
            });
            return constructions;
        } catch (error) {
            console.error("Erro ao buscar obras no banco de dados:", error);
            throw new Error("Falha na consulta ao banco de dados para listar obras.");
        }
    }

    // 2. FUNÇÃO PARA BUSCAR POR ID (NOVA CHAVE)
    static async getConstructionById(obraId, userId) {
        try {
            const construction = await Construction.findOne({
                where: {
                    id: obraId,
                    userId: userId // SEGURANÇA: Garante que só o dono pode ver
                },
                attributes: ['id', 'userId', 'cnpjCpf', 'nomeObra', 'localObra', 'cep', 'dataInicio', 'previsaoTermino', 'fotoObra', 'status', 'progresso']
            });
            return construction;
        } catch (error) {
            console.error("Erro ao buscar obra por ID:", error);
            throw new Error("Falha na consulta ao banco de dados para buscar obra.");
        }
    }

    // 3. FUNÇÃO DE CADASTRO
    static async createConstruction(data) {
        try {
            const newConstruction = await Construction.create(data);
            return newConstruction;
        } catch (error) {
            console.error("Erro no Service ao criar obra:", error);
            throw new Error("Falha ao criar nova obra no banco de dados.");
        }
    }

    // 4. FUNÇÃO DE EDIÇÃO
    static async updateConstruction(obraId, userId, updateData) {
        // Remove o userId dos dados de atualização para evitar que o usuário mude o dono da obra
        delete updateData.userId;
       
        const [updatedRows] = await Construction.update(updateData, {
            where: {
                id: obraId,
                userId: userId // SEGURANÇA: Garante que só o dono pode editar
            }
        });

        // Se atualizou 1 linha, busca a obra atualizada para retornar
        if (updatedRows === 1) {
            return await Construction.findByPk(obraId);
        }
       
        return null;
    }
   
    // 5. FUNÇÃO DE EXCLUSÃO
    static async deleteConstruction(obraId, userId) {
        const deletedRows = await Construction.destroy({
            where: {
                id: obraId,
                userId: userId
            }
        });
        return deletedRows;
    }
}

module.exports = ConstructionService;

