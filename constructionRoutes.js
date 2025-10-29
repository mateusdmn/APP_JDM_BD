const express = require('express');
const router = express.Router();
// Importe o Controller
const ConstructionController = require('./controllers/ConstructionController'); 
// Importe o Middleware de Autenticação
const authMiddleware = require('./middlewares/auth'); 

// Rota POST protegida para CADASTRAR uma obra
router.post('/register', authMiddleware, ConstructionController.registerConstruction);

// Rota GET protegida para LISTAR as obras (NOVA ROTA)
// Esta rota usará o "Include" do Sequelize para trazer o nome do usuário.
router.get('/list', authMiddleware, ConstructionController.listConstructions); 

module.exports = router;