// monetizationRoutes.js
const express = require('express');
const router = express.Router();
const Monetization = require('./models/Monetization');

// 1. CADASTRAR monetização
router.post('/cadastrar', async (req, res) => {
    try {
        const nova = await Monetization.create(req.body);
        res.status(201).json(nova);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar' });
    }
});

// 2. CONSULTAR monetizações (Ativas)
router.get('/listar', async (req, res) => {
    try {
        const planos = await Monetization.findAll({ where: { ativo: true } });
        res.json(planos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar' });
    }
});

// 3. ALTERAR monetização
router.put('/alterar/:id', async (req, res) => {
    try {
        await Monetization.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Alterado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar' });
    }
});

// 4. ATIVAR/INATIVAR (Alterar o status)
router.patch('/status/:id', async (req, res) => {
    try {
        const plano = await Monetization.findByPk(req.params.id);
        plano.ativo = !plano.ativo; // Inverte o status atual
        await plano.save();
        res.json({ message: `Status alterado para: ${plano.ativo}` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao mudar status' });
    }
});

module.exports = router;