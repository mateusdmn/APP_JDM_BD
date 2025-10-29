const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/AuthController'); // <-- Assumindo que este caminho está correto

// Rotas PÚBLICAS (NÃO precisam de Token)
router.post('/register', AuthController.register); 
router.post('/login', AuthController.login);

module.exports = router;
