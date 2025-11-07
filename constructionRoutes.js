// constructionRoutes.js
const express = require('express');
const router = express.Router();
const ConstructionController = require('./controllers/ConstructionController');
const authMiddleware = require('./middlewares/auth');

// Rota POST protegida para CADASTRAR uma obra
// Endpoint: POST /api/construction/register
router.post('/register', authMiddleware, ConstructionController.registerConstruction);

// Rota GET protegida para LISTAR as obras do usuário
// Endpoint: GET /api/construction/list
router.get('/list', authMiddleware, ConstructionController.listUserConstructions);

// Rota GET protegida para BUSCAR uma única obra pelo ID (Chave para a Edição)
// Endpoint: GET /api/construction/:id
router.get('/:id', authMiddleware, ConstructionController.getConstructionById);

// Rota PUT protegida para EDITAR uma obra
// Endpoint: PUT /api/construction/:id
router.put('/:id', authMiddleware, ConstructionController.updateConstruction);

// Rota DELETE protegida para DELETAR uma obra
// Endpoint: DELETE /api/construction/:id
router.delete('/:id', authMiddleware, ConstructionController.deleteConstruction);

module.exports = router;