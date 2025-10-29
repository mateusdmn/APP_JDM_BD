document.addEventListener('DOMContentLoaded', function() {
    // -----------------------------------------------------------------
    // LÓGICA DE AUTENTICAÇÃO E DADOS DO USUÁRIO
    // -----------------------------------------------------------------
    const currentUser = JSON.parse(localStorage.getItem('jdm_currentUser'));

    // Redireciona para a página de login se não houver usuário logado
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    function saveCurrentUser() {
        sessionStorage.setItem('jdm_currentUser', JSON.stringify(currentUser));
    }

    // -----------------------------------------------------------------
    // LÓGICA DE INTERFACE E EVENTOS
    // -----------------------------------------------------------------
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme + '-theme');
    }
    
    // Aplica o tema do usuário ao carregar a página
    applyTheme(currentUser.settings?.theme || 'light');

    // Atualiza os elementos HTML com os dados do usuário
    const profileNameEl = document.getElementById('profileNameModern');
    if (profileNameEl) profileNameEl.textContent = currentUser.name;

    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) profileEmailEl.textContent = currentUser.email;

    const profileImageEl = document.getElementById('profileImage');
    if (profileImageEl) profileImageEl.src = currentUser.photo;

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = currentUser.name?.split(' ')[0] || currentUser.name;

    // Lógica do menu lateral
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            mainContent.classList.add('shifted');
        });
    }

    if (closeSidebar && sidebar && mainContent) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
            mainContent.classList.remove('shifted');
        });
    }

    // Mapeamento de botões para abrir modais
    const modalButtons = {
        'changePhotoBtn': 'changePhotoModal',
        'changePhotoOverlay': 'changePhotoModal',
        'changePasswordBtn': 'changePasswordModal',
        'changePhoneBtn': 'changePhoneModal',
        'changeEmailBtn': 'changeEmailModal',
        'generalSettingsBtn': 'generalSettingsModal',
        'privacySettingsBtn': 'privacySettingsModal'
    };

    // Adiciona event listeners para abrir os modais
    Object.entries(modalButtons).forEach(([btnId, modalId]) => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'block';
                    // Preenche campos do modal se existirem
                    if (modalId === 'changePhoneModal') {
                        document.getElementById('newPhone').value = currentUser.phone || '';
                    } else if (modalId === 'changeEmailModal') {
                        document.getElementById('currentEmail').value = currentUser.email;
                    } else if (modalId === 'generalSettingsModal') {
                        document.getElementById('themePreference').value = currentUser.settings.theme;
                    }
                }
            });
        }
    });

    // Fechar modais
    document.querySelectorAll('.close-modal, .modal-footer .btn-secondary, #closePrivacy').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Fechar modais clicando fora
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // -----------------------------------------------------------------
    // LÓGICA DE SALVAMENTO DOS MODAIS
    // -----------------------------------------------------------------
    const savePhotoBtn = document.getElementById('savePhoto');
    if (savePhotoBtn) {
        savePhotoBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('newPhoto');
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentUser.photo = e.target.result;
                    document.getElementById('profileImage').src = currentUser.photo;
                    saveCurrentUser();
                    alert('Foto de perfil alterada com sucesso!');
                    document.getElementById('changePhotoModal').style.display = 'none';
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                alert('Por favor, selecione uma imagem.');
            }
        });
    }

    const savePasswordBtn = document.getElementById('savePassword');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', () => {
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (!newPassword || !confirmNewPassword) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            alert('Senha alterada com sucesso!');
            document.getElementById('changePasswordModal').style.display = 'none';
        });
    }

    const savePhoneBtn = document.getElementById('savePhone');
    if (savePhoneBtn) {
        savePhoneBtn.addEventListener('click', () => {
            const newPhone = document.getElementById('newPhone').value;
            if (!newPhone) {
                alert('Por favor, insira um número de telefone.');
                return;
            }
            currentUser.phone = newPhone;
            saveCurrentUser();
            document.getElementById('profilePhone').textContent = newPhone; // Supondo que exista um elemento para exibir o telefone
            alert('Telefone alterado com sucesso!');
            document.getElementById('changePhoneModal').style.display = 'none';
        });
    }

    const saveEmailBtn = document.getElementById('saveEmail');
    if (saveEmailBtn) {
        saveEmailBtn.addEventListener('click', () => {
            const newEmail = document.getElementById('newEmail').value;
            if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.')) {
                alert('Por favor, insira um email válido.');
                return;
            }
            currentUser.email = newEmail;
            saveCurrentUser();
            document.getElementById('profileEmail').textContent = newEmail;
            alert('Email alterado com sucesso!');
            document.getElementById('changeEmailModal').style.display = 'none';
        });
    }

    const saveGeneralSettingsBtn = document.getElementById('saveGeneralSettings');
    if (saveGeneralSettingsBtn) {
        saveGeneralSettingsBtn.addEventListener('click', () => {
            const selectedTheme = document.getElementById('themePreference').value;
            currentUser.settings.theme = selectedTheme;
            saveCurrentUser();
            applyTheme(selectedTheme);
            alert('Configurações salvas com sucesso!');
            document.getElementById('generalSettingsModal').style.display = 'none';
        });
    }

    const logoutProfileBtn = document.getElementById('logoutProfileBtn');
    if (logoutProfileBtn) {
        logoutProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('jdm_currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Máscara de telefone
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