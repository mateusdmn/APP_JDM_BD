// materialRoutes.js (Rotas de Materiais Protegidas)
const express = require('express');
const router = express.Router();
const authMiddleware = require('./middlewares/auth'); 
// const MaterialController = require('./controllers/MaterialController'); // Se você não criou, remova ou comente

// Usa o Middleware para PROTEGER AS ROTAS DE MATERIAL (CRUD)
router.use(authMiddleware); 

// Rotas de Material (exemplo: estas estarão protegidas)
// router.get('/', MaterialController.list); 
// router.post('/', MaterialController.create); 

module.exports = router;