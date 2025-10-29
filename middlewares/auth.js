const jwt = require('jsonwebtoken');

// IMPORTANTE: Esta chave DEVE ser a mesma usada no AuthService.js para assinar o token.
// Sugestão: Use variáveis de ambiente (process.env.JWT_SECRET) para produção.
const SECRET = 'sua_chave_secreta_jwt_muito_segura'; 

module.exports = (req, res, next) => {
    // 1. Pega o token do cabeçalho 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    // O formato esperado é "Bearer TOKEN", então separa o token
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    const [scheme, token] = parts;

    // Garante que o prefixo é "Bearer"
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: 'Token mal formatado.' });
    }

    // 2. Verifica e decodifica o token
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            // Se der erro (expirado, assinatura inválida), retorna 401
            return res.status(401).json({ message: 'Token inválido.' }); 
        }

        // 3. Se o token for válido, injeta o ID do usuário na requisição
        // Este req.userId será usado no ConstructionController para saber quem está cadastrando a obra.
        req.userId = decoded.id; 
        
        // Continua para a próxima função da rota (o Controller)
        return next();
    });
};