const API_URL = 'http://localhost:3000/api/auth'; 

// --- FUNÇÕES DE UTILIDADE ---

// Funções auxiliares (manter)
function showError(element, message) {
    if (element) {
        // Garantir que a mensagem de sucesso está limpa
        const successElement = document.getElementById('registerSuccess');
        if (successElement) {
            successElement.style.display = 'none';
        }

        element.textContent = message;
        element.style.display = 'block';
        element.style.color = 'red'; // Garante que o erro é vermelho
        // Ajustei o tempo para ser mais visível
        setTimeout(() => { element.style.display = 'none'; }, 5000); 
    }
}
function showSuccess(element, message) { // Adicionado para a tela de cadastro
    if (element) {
        // Garantir que a mensagem de erro está limpa
        const errorElement = document.getElementById('registerError');
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        element.textContent = message;
        element.style.display = 'block';
        element.style.color = 'green';
        setTimeout(() => { element.style.display = 'none'; }, 5000); 
    }
}

// Verifica token no localStorage e redireciona
function checkAuthAndRedirect() {
    const token = localStorage.getItem('jdm_token'); 
    const path = window.location.pathname;

    // Se estiver em index.html ou cadastro.html E tiver token, vai para app.html
    if ((path.includes('index.html') || path.includes('cadastro.html')) && token) {
        window.location.href = 'app.html';
    } 
    // Se estiver em app.html E NÃO tiver token, volta para index.html
    else if (path.includes('app.html') && !token) {
        window.location.href = 'index.html';
    }
}

// --- FUNÇÕES DE MÁSCARA (Manter) ---

/** Aplica a máscara de CPF: 000.000.000-00 */
function maskCPF(value) {
    value = value.replace(/\D/g, ""); 
    value = value.replace(/(\d{3})(\d)/, "$1.$2"); 
    value = value.replace(/(\d{3})(\d)/, "$1.$2"); 
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); 
    return value.substring(0, 14); 
}

/** Aplica a máscara de Telefone: (00) 00000-0000 */
function maskPhone(value) {
    value = value.replace(/\D/g, ""); 
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); 
    value = value.replace(/(\d{4,5})(\d{4})$/, "$1-$2"); 
    return value.substring(0, 15);
}

// --- FUNÇÕES DE VALIDAÇÃO (Manter) ---
function validateRegistrationForm(elements) {
    const { name, cpf, phone, email, password, confirmPassword, errorElement } = elements;

    // Validação de Nome Completo
    if (!name.value.trim().includes(' ')) {
        showError(errorElement, 'Por favor, insira o nome completo (nome e sobrenome).');
        return false;
    }

    // Validação de CPF
    const rawCpf = cpf.value.replace(/\D/g, ""); 
    if (rawCpf.length !== 11) {
        showError(errorElement, 'O CPF deve conter exatamente 11 dígitos.');
        return false;
    }

    // Validação de Telefone
    const rawPhone = phone.value.replace(/\D/g, "");
    if (rawPhone.length < 10 || rawPhone.length > 11) {
        showError(errorElement, 'O telefone deve conter 10 ou 11 dígitos (com DDD).');
        return false;
    }

    // Validação de E-mail
    if (!email.value.includes('@') || !email.value.includes('.')) {
        showError(errorElement, 'O e-mail deve ser válido (ex: seu@email.com).');
        return false;
    }

    // Validação de Senhas
    if (password.value.length < 6) {
        showError(errorElement, 'A senha deve ter no mínimo 6 caracteres.');
        return false;
    }

    if (password.value !== confirmPassword.value) {
        showError(errorElement, 'As senhas não coincidem!');
        return false;
    }

    return true; 
}


// --- LÓGICA PRINCIPAL (DOMContentLoaded) ---

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndRedirect(); 
    
    // Elementos de mensagem
    const errorLogin = document.getElementById('loginError');
    const errorRegister = document.getElementById('registerError');
    const successRegister = document.getElementById('registerSuccess');

    // Elementos de formulário de Cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerName = document.getElementById('registerName');
        const registerCPF = document.getElementById('registerCPF');
        const registerPhone = document.getElementById('registerPhone');

        // Adiciona as Máscaras de CPF e Telefone
        registerCPF.addEventListener('input', (e) => {
            e.target.value = maskCPF(e.target.value);
        });

        registerPhone.addEventListener('input', (e) => {
            e.target.value = maskPhone(e.target.value);
        });
    }

    // --- 1. LÓGICA DE LOGIN (CHAMANDO A ROTA POST /api/auth/login) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // SUCESSO! Salva o token JWT e o objeto do usuário
                    localStorage.setItem('jdm_token', data.token); 
                    if (data.user) {
                        localStorage.setItem('jdm_currentUser', JSON.stringify(data.user)); 
                    } else {
                        console.warn("Back-end não retornou o objeto 'user' no login.");
                    }
                    
                    window.location.href = 'app.html';
                } else {
                    showError(errorLogin, data.message || 'E-mail ou senha incorretos. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showError(errorLogin, 'Erro ao conectar com o servidor. Verifique se o Node.js está rodando ou o CORS.');
            }
        });
    }

    // --- 2. LÓGICA DE CADASTRO (CHAMANDO A ROTA POST /api/auth/register) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Coleta de TODOS os dados do formulário
            const name = document.getElementById('registerName');
            const email = document.getElementById('registerEmail');
            const password = document.getElementById('registerPassword');
            const confirmPassword = document.getElementById('registerConfirmPassword');
            const cpf = document.getElementById('registerCPF');
            const phone = document.getElementById('registerPhone');
            const address = document.getElementById('registerAddress');

            // Mapeia os elementos para a função de validação
            const elements = { 
                name, cpf, phone, email, password, confirmPassword, errorElement: errorRegister 
            };

            // Realiza todas as validações de cliente
            if (!validateRegistrationForm(elements)) {
                return; 
            }
            
            // Prepara os dados para envio (removendo máscaras)
            const userData = {
                name: name.value.trim(),
                email: email.value.trim(),
                password: password.value,
                cpf: cpf.value.replace(/\D/g, ""), 
                phone: phone.value.replace(/\D/g, ""),
                address: address.value.trim()
            };
            
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData) 
                });

                const data = await response.json();
                
                if (response.ok) {
                    // SUCESSO! Salva o token e o usuário
                    localStorage.setItem('jdm_token', data.token); 
                    if (data.user) {
                        localStorage.setItem('jdm_currentUser', JSON.stringify(data.user));
                    }
                    
                    showSuccess(successRegister, 'Cadastro realizado com sucesso! Redirecionando...');
                    
                    setTimeout(() => {
                        window.location.href = 'app.html';
                    }, 1000);
                } else {
                    // FALHA: Exibe a mensagem de erro do back-end
                    let errorMessage = data.message || 'Erro ao cadastrar. Tente novamente.';

                    // Ajuste para erros de unicidade de CPF e Email
                    if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique') || errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('cpf')) {
                        errorMessage = 'E-mail ou CPF já cadastrados. Por favor, utilize outros dados.';
                    } else if (data.errors && data.errors.length > 0) {
                        // Caso o Sequelize retorne múltiplos erros de validação
                        errorMessage = data.errors[0].message || errorMessage;
                    }

                    showError(errorRegister, errorMessage);
                }
            } catch (error) {
                console.error('Erro na requisição de cadastro:', error);
                showError(errorRegister, 'Erro ao conectar com o servidor. Verifique se o Node.js está rodando ou o CORS.');
            }
        });
    }

    // --- 3. LÓGICA DE LOGOUT ---
    const logoutButton = document.getElementById('logoutBtn'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jdm_token');
            localStorage.removeItem('jdm_currentUser'); // Remove os dados do usuário também
            window.location.href = 'index.html'; 
        });
    }
});