document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:3000/api/auth'; 
    
    // ⭐️ CONSISTÊNCIA: Agora pega o token e dados APENAS do localStorage
    const token = localStorage.getItem('jdm_token'); 
    let currentUser = JSON.parse(localStorage.getItem('jdm_currentUser')) || {};

    // -----------------------------------------------------------------
    // LÓGICA DE AUTENTICAÇÃO E DADOS DO USUÁRIO
    // -----------------------------------------------------------------
    
    // ❌ A lógica de redirecionamento (if (!token) {...}) foi removida daqui,
    // pois setupGlobalAuth() em auth.js já fez essa verificação.

    /**
     * Busca os dados mais recentes do perfil no backend (GET /api/auth/profile)
     */
    async function fetchUserProfile() {
        if (!token) return; // Não tenta buscar se por acaso o token sumiu.

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'GET',
                headers: {
                    // Certifica que o token está sendo enviado para o backend
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                // Se o token for inválido, limpa e força logout (segurança)
                localStorage.removeItem('jdm_token');
                localStorage.removeItem('jdm_currentUser');
                window.location.href = 'index.html';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            const data = await response.json();
            
            // Atualiza o objeto currentUser com os dados do banco
            currentUser = {
                ...currentUser,
                id: data.id,
                name: data.name,
                email: data.email,
                telefone: data.phone, // Mapeia phone para telefone
                endereco: data.edcadastrado, // Mapeia edcadastrado para endereco
                settings: data.settings || currentUser.settings || { theme: 'light' }
            };
            // ⭐️ Atualiza o localStorage com os dados mais recentes do backend
            localStorage.setItem('jdm_currentUser', JSON.stringify(currentUser)); 
            
            updateUI(currentUser);

        } catch (error) {
            console.error("Erro ao buscar perfil:", error.message);
            // Mostrar mensagem de erro na UI, se necessário
        }
    }

    /**
     * Atualiza os elementos HTML com os dados do usuário.
     */
    function updateUI(user) {
        document.getElementById('profileNameModern').textContent = user.name || 'Usuário';
        document.getElementById('profileEmail').textContent = user.email || 'email@exemplo.com';
        // Atualiza o nome abreviado no cabeçalho
        const headerUserName = document.getElementById('userName');
        if (headerUserName) {
            headerUserName.textContent = user.name?.split(' ')[0] || user.name || 'Usuário';
        }

        // Aplica o tema
        applyTheme(user.settings?.theme || 'light');
    }

    // Chama a função de busca ao carregar a página
    fetchUserProfile();

    // -----------------------------------------------------------------
    // LÓGICA DE PERSISTÊNCIA (PUT /api/auth/profile)
    // -----------------------------------------------------------------

    /**
     * Envia os dados atualizados para o backend.
     * @param {Object} updateData Objeto com os campos a serem atualizados (ex: { phone: 'novo_num' })
     */
    async function saveProfileChange(updateData, successMessage) {
        if (!token) {
            alert('Erro: Token de autenticação não encontrado.');
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao salvar a alteração.');
            }

            // Se for bem-sucedido, busca o perfil atualizado para sincronizar o frontend
            await fetchUserProfile();
            alert(successMessage);

            // Fecha o modal
            document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');

        } catch (error) {
            alert(`Erro: ${error.message}`);
            console.error("Erro ao atualizar perfil:", error);
        }
    }

    // -----------------------------------------------------------------
    // LÓGICA DE EVENTOS (Modais e Botões de Ação)
    // -----------------------------------------------------------------
    
    // Função utilitária de tema
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme + '-theme');
        // ⭐️ Adicional: Salva a preferência de tema no backend também
        if (currentUser.settings?.theme !== theme) {
            saveProfileChange({ settings: { ...currentUser.settings, theme } }, 'Tema alterado com sucesso!');
        }
    }
    
    const themePreference = document.getElementById('themePreference');
    if (themePreference) {
        themePreference.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }

    // Mapeamento de botões para abrir modais (mantido)
    const modalButtons = {
        'changePhotoBtn': 'changePhotoModal',
        'changePhotoOverlay': 'changePhotoModal',
        'changePasswordBtn': 'changePasswordModal',
        'changeAddressBtn': 'changeAddressModal', 
        'changePhoneBtn': 'changePhoneModal',
        'changeEmailBtn': 'changeEmailModal',
        'generalSettingsBtn': 'generalSettingsModal',
        'privacySettingsBtn': 'privacySettingsModal'
    };

    // Event listeners para abrir os modais (mantido e melhorado)
    Object.entries(modalButtons).forEach(([btnId, modalId]) => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = document.getElementById(modalId);
                if (modal) {
                    // Preenche campos do modal (usa o objeto currentUser ATUALIZADO)
                    if (modalId === 'changePhoneModal') {
                        document.getElementById('newPhone').value = currentUser.telefone || '';
                    } else if (modalId === 'changeAddressModal') { 
                        document.getElementById('newAddress').value = currentUser.endereco || ''; 
                    } else if (modalId === 'changeEmailModal') {
                        document.getElementById('currentEmail').value = currentUser.email || '';
                        document.getElementById('newEmail').value = currentUser.email || ''; 
                    } else if (modalId === 'generalSettingsModal') {
                        // Garante que o tema atual está selecionado
                        document.getElementById('themePreference').value = currentUser.settings?.theme || 'light';
                    }
                    modal.style.display = 'block';
                }
            });
        }
    });

    // Fechar modais (simplificado)
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // -----------------------------------------------------------------
    // EVENTOS DE SALVAMENTO (INTEGRAÇÃO COM saveProfileChange) - MANTIDOS
    // -----------------------------------------------------------------

    // Salvar Endereço 
    const saveAddressBtn = document.getElementById('saveAddress');
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', () => {
            const newAddress = document.getElementById('newAddress').value;
            if (!newAddress) {
                alert('Por favor, insira um endereço.');
                return;
            }
            // Mapeia o campo do front 'newAddress' para o campo do banco 'edcadastrado'
            saveProfileChange({ edcadastrado: newAddress }, 'Endereço alterado com sucesso!');
        });
    }

    // Salvar Telefone
    const savePhoneBtn = document.getElementById('savePhone');
    if (savePhoneBtn) {
        savePhoneBtn.addEventListener('click', () => {
            const newPhone = document.getElementById('newPhone').value.replace(/\D/g, ''); // Limpa máscara
            if (newPhone.length < 10) {
                alert('Por favor, insira um número de telefone válido.');
                return;
            }
            saveProfileChange({ phone: newPhone }, 'Telefone alterado com sucesso!');
        });
    }

    // Salvar Senha
    const savePasswordBtn = document.getElementById('savePassword');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', () => {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                alert('As novas senhas não coincidem.');
                return;
            }
            
            saveProfileChange({ currentPassword, newPassword }, 'Senha alterada com sucesso! Você precisará fazer login novamente.');
        });
    }

    // Salvar Email
    const saveEmailBtn = document.getElementById('saveEmail');
    if (saveEmailBtn) {
        saveEmailBtn.addEventListener('click', () => {
            const newEmail = document.getElementById('newEmail').value;
            if (newEmail === currentUser.email) {
                 alert('O novo email é igual ao atual.');
                 return;
            }
            if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.')) {
                alert('Por favor, insira um email válido.');
                return;
            }
            saveProfileChange({ email: newEmail }, 'Email alterado com sucesso!');
        });
    }

    // ❌ REMOVIDO: A lógica de logout foi movida para o auth.js
    // const logoutProfileBtn = document.getElementById('logoutProfileBtn');
    // ...

    // Máscara de telefone (mantida e simplificada)
    const newPhoneInput = document.getElementById('newPhone');
    if (newPhoneInput) {
        newPhoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                if (value.length > 10) {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                }
            }
            e.target.value = value;
        });
    }
});