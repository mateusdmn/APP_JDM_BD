// authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('./controllers/AuthController'); 
const authMiddleware = require('./middlewares/auth'); 

// Rotas PÚBLICAS
router.post('/register', AuthController.register); 
router.post('/login', AuthController.login);

// Rotas PRIVADAS (PRECISAM de Token)

// NOVO: Rota para buscar os dados de perfil do usuário (GET)
router.get('/profile', authMiddleware, AuthController.getProfile); 

// NOVO: Rota para atualizar o perfil do usuário (PUT/PATCH)
router.put('/profile', authMiddleware, AuthController.updateProfile); 

module.exports = router;