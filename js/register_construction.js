document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Cadastro de Obra carregada!');

    const fotoObraInput = document.getElementById('fotoObra');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const imagePreview = document.getElementById('imagePreview');
    const constructionRegisterForm = document.getElementById('constructionRegisterForm');
    const cepInput = document.getElementById('cep');
    
    // URL do endpoint de cadastro de obra no backend
    const API_REGISTER_URL = 'http://localhost:3000/api/construction/register'; 

    // --- Função para exibir a notificação (Não alterada) ---
    function showNotification(message, type = 'success', duration = 3000) {
        let notification = document.createElement('div');
        notification.classList.add('notification-message', type);
        notification.innerHTML = `
            ${message}
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        document.body.appendChild(notification);
        notification.offsetHeight; 
        notification.classList.add('show');

        notification.querySelector('.close-notification').addEventListener('click', () => {
            hideNotification(notification);
        });

        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }

    function hideNotification(notificationElement) {
        notificationElement.classList.remove('show');
        notificationElement.addEventListener('transitionend', () => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, { once: true });
    }
    // --- Fim da Função de Notificação ---

    // Função para limpar e formatar o CEP no INPUT
    if (cepInput) {
        cepInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
            // Aplica a máscara 00000-000
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;
        });
    }

    // Função para limpar CNPJ/CPF no ENVIO (remove máscara)
    function cleanCnpjCpf(value) {
        return value.replace(/\D/g, ''); 
    }

    // Pré-visualização da imagem selecionada (Não alterada)
    if (fotoObraInput) {
        fotoObraInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                fileNameDisplay.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da Obra">`;
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'Nenhuma foto selecionada';
                imagePreview.innerHTML = 'Nenhuma imagem selecionada';
            }
        });
    }

    // Lógica para submeter o formulário (AGORA REAL!)
    if (constructionRegisterForm) {
        constructionRegisterForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const token = localStorage.getItem('jdm_token');
            if (!token) {
                showNotification('Você precisa estar logado para cadastrar uma obra.', 'error');
                // Opcional: Redirecionar para a página de login
                // window.location.href = 'index.html'; 
                return;
            }

            // Coletar e limpar os dados
            const rawCnpjCpf = document.getElementById('cnpjCpf').value;
            const rawCep = document.getElementById('cep').value;
            
            const constructionData = {
                // Limpa CNPJ/CPF para enviar apenas números
                cnpjCpf: cleanCnpjCpf(rawCnpjCpf), 
                nomeObra: document.getElementById('nomeObra').value,
                localObra: document.getElementById('localObra').value,
                // Limpa CEP para enviar apenas números (backend espera 8 dígitos)
                cep: rawCep.replace('-', ''), 
                dataInicio: document.getElementById('dataInicio').value,
                previsaoTermino: document.getElementById('previsaoTermino').value || null // Envia null se opcional e vazio
            };
            
            // NOTA: O upload da foto (fotoObra) requer um backend com Multer e FormData,
            // que não foi implementado. Estamos enviando apenas JSON por enquanto.
            
            try {
                const response = await fetch(API_REGISTER_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // ENVIO DO TOKEN!
                    },
                    body: JSON.stringify(constructionData)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification(`Obra "${result.construction.nomeObra}" cadastrada com sucesso!`, 'success');
                    
                    // Limpa o formulário e reseta a preview
                    constructionRegisterForm.reset();
                    fileNameDisplay.textContent = 'Nenhuma foto selecionada';
                    imagePreview.innerHTML = '';
                } else {
                    // Erro retornado pelo Controller ou Middleware
                    showNotification(`Erro no cadastro: ${result.message || 'Verifique se todos os campos estão corretos.'}`, 'error', 5000);
                }
            } catch (error) {
                console.error('Erro na comunicação com o servidor:', error);
                showNotification('Erro ao conectar com o servidor. Verifique sua conexão e se o Node.js está rodando.', 'error', 5000);
            }
        });
    }
});