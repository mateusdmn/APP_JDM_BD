// js/register_construction.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Cadastro e Gerenciamento de Obra carregada!');

    const fotoObraInput = document.getElementById('fotoObra');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const imagePreview = document.getElementById('imagePreview');
    const constructionRegisterForm = document.getElementById('constructionRegisterForm');
    const cepInput = document.getElementById('cep');
    const obraCardsGrid = document.getElementById('obraCardsGrid');
   
    // Elementos de Edição
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');
    const constructionIdInput = document.getElementById('constructionId');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    // URLs dos endpoints
    const API_FETCH_URL = 'http://localhost:3000/api/construction/list';
    const API_BASE_URL = 'http://localhost:3000/api/construction'; // Usado para POST, PUT e DELETE

    // --- Funções de Utilidade ---

    function showNotification(message, type = 'success', duration = 3000) {
        console.log(`[NOTIFICAÇÃO ${type.toUpperCase()}]: ${message}`);
        alert(message);
    }
    function cleanCnpjCpf(value) { return value.replace(/\D/g, ''); }
    function cleanCep(value) { return value.replace(/\D/g, ''); }
   
    // [MANTER: Lógica de Formatação de CEP e Preview de Imagem]
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            const rawValue = cleanCep(e.target.value);
            let formattedValue = '';
            if (rawValue.length > 5) {
                formattedValue = rawValue.substring(0, 5) + '-' + rawValue.substring(5, 8);
            } else {
                formattedValue = rawValue;
            }
            e.target.value = formattedValue;
        });
    }

    if (fotoObraInput) {
        fotoObraInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                fileNameDisplay.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview da Obra" style="max-width: 100px; max-height: 100px; display: block;">`;
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'Nenhuma foto selecionada';
                imagePreview.innerHTML = '';
            }
        });
    }

    // ==========================================================
    // Funções de Gerenciamento da Lista (FETCH, RENDER, DELETE, UPDATE)
    // ==========================================================
   
    // Função para buscar uma única obra (necessário para preencher o form de edição)
    async function fetchConstructionById(id) {
        const token = localStorage.getItem('jdm_token');
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'GET', // Assumindo que você tem um GET para /api/construction/:id
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                return await response.json();
            } else {
                const result = await response.json();
                showNotification(`Erro ao buscar obra para edição: ${result.message}`, 'error');
                return null;
            }
        } catch (error) {
            console.error('Erro ao buscar obra por ID:', error);
            showNotification('Erro de rede ao buscar obra.', 'error');
            return null;
        }
    }


    // 1. CARREGAR DADOS NO FORMULÁRIO PARA EDIÇÃO
    async function loadConstructionForEdit(id) {
        const result = await fetchConstructionById(id);

        if (result && result.construction) {
            const obra = result.construction;

            // Altera o formulário para modo Edição
            constructionIdInput.value = obra.id;
            formTitle.textContent = `Editar Obra: ${obra.nomeObra}`;
            submitButton.innerHTML = '<i class="fas fa-save"></i> Salvar Edição';
            cancelEditBtn.style.display = 'inline-block';

            // Preenche os campos
            document.getElementById('cnpjCpf').value = obra.cnpjCpf;
            document.getElementById('nomeObra').value = obra.nomeObra;
            document.getElementById('localObra').value = obra.localObra;
            document.getElementById('cep').value = obra.cep; // O CEP aqui virá sem máscara do BD
            document.getElementById('dataInicio').value = obra.dataInicio;
            document.getElementById('previsaoTermino').value = obra.previsaoTermino || '';
            // Nota: O campo fotoObra é do tipo file, não pode ser preenchido diretamente por segurança.
            // Se houver fotoObra (URL), você pode mostrar a preview dela
            if (obra.fotoObra) {
                fileNameDisplay.textContent = 'Foto existente';
                imagePreview.innerHTML = `<img src="${obra.fotoObra}" alt="Foto Atual" style="max-width: 100px; max-height: 100px; display: block;">`;
            } else {
                fileNameDisplay.textContent = 'Nenhuma foto selecionada';
                imagePreview.innerHTML = '';
            }

            // Rola para o topo para ver o formulário
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
   
    // 2. CANCELAR O MODO DE EDIÇÃO
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetFormToRegisterMode);
    }
   
    function resetFormToRegisterMode() {
        constructionRegisterForm.reset();
        constructionIdInput.value = '';
        formTitle.textContent = 'Cadastre Sua Obra';
        submitButton.innerHTML = '<i class="fas fa-plus-circle"></i> Cadastrar Obra';
        cancelEditBtn.style.display = 'none';
        fileNameDisplay.textContent = 'Nenhuma foto selecionada';
        imagePreview.innerHTML = '';
        // Remove a rolagem (opcional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. BUSCAR OBRAS PARA LISTAGEM
    async function fetchUserConstructions() {
        const token = localStorage.getItem('jdm_token');
        if (!token) {
            obraCardsGrid.innerHTML = '<p class="error-message">Por favor, faça login para visualizar suas obras.</p>';
            return;
        }

        try {
            const response = await fetch(API_FETCH_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
           
            // Verifique o objeto de resposta do seu back-end.
            // O backend retorna 'constructions'
            if (response.ok && result.constructions) {
                renderConstructions(result.constructions);
            } else {
                obraCardsGrid.innerHTML = `<p class="error-message">Erro ao carregar obras: ${result.message || 'Falha na conexão.'}</p>`;
            }
        } catch (error) {
            console.error('Erro ao buscar obras:', error);
            obraCardsGrid.innerHTML = '<p class="error-message">Erro de rede. Servidor fora do ar.</p>';
        }
    }

    // 4. RENDERIZAR OBRAS
    function renderConstructions(constructions) {
        obraCardsGrid.innerHTML = '';

        if (constructions.length === 0) {
            obraCardsGrid.innerHTML = '<p class="no-data-message">Você ainda não possui obras cadastradas.</p>';
            return;
        }

        constructions.forEach(obra => {
            const card = document.createElement('div');
            card.className = 'obra-card';
            card.setAttribute('data-id', obra.id);

            const inicio = obra.dataInicio ? new Date(obra.dataInicio).toLocaleDateString('pt-BR') : 'N/A';
            const termino = obra.previsaoTermino ? new Date(obra.previsaoTermino).toLocaleDateString('pt-BR') : 'Sem Previsão';

            // Nota: Adicione progresso/status aqui se necessário.
            // Eles não estavam na lista original, mas podem ser úteis para a visualização.

            card.innerHTML = `
                <div class="obra-name">${obra.nomeObra}</div>
                <div class="obra-detail"><i class="fas fa-id-card"></i> CNPJ/CPF: ${obra.cnpjCpf}</div>
                <div class="obra-detail"><i class="fas fa-map-marker-alt"></i> Local: ${obra.localObra}</div>
                <div class="obra-detail"><i class="fas fa-calendar-alt"></i> Início: ${inicio}</div>
                <div class="obra-detail"><i class="fas fa-hourglass-half"></i> Término: ${termino}</div>
               
                <div class="obra-actions">
                    <button class="action-btn edit-btn" data-id="${obra.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="action-btn delete-btn" data-id="${obra.id}"><i class="fas fa-trash-alt"></i> Deletar</button>
                </div>
            `;
            obraCardsGrid.appendChild(card);
        });

        addConstructionEventListeners();
    }

    // 5. ADICIONAR LISTENERS (DELETE E EDITAR)
    function addConstructionEventListeners() {
        obraCardsGrid.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const obraId = this.getAttribute('data-id');
                if (confirm(`Tem certeza que deseja deletar a obra ID ${obraId}?`)) {
                    await deleteConstruction(obraId);
                }
            });
        });
       
        obraCardsGrid.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const obraId = this.getAttribute('data-id');
                loadConstructionForEdit(obraId); // CHAMA A FUNÇÃO DE EDIÇÃO
            });
        });
    }

    // 6. DELETAR OBRA
    async function deleteConstruction(id) {
        const token = localStorage.getItem('jdm_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showNotification(`Obra ID ${id} deletada com sucesso!`, 'success');
                fetchUserConstructions();
            } else {
                const result = await response.json();
                showNotification(`Erro ao deletar obra: ${result.message || 'Falha na exclusão.'}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar obra:', error);
            showNotification('Erro de rede ao tentar deletar.', 'error');
        }
    }


    // ==========================================================
    // Lógica de Submissão do Formulário (UNIFICADA)
    // ==========================================================
   
    if (constructionRegisterForm) {
        constructionRegisterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const token = localStorage.getItem('jdm_token');
            const obraId = constructionIdInput.value; // Verifica se há um ID (modo edição)
           
            if (!token) {
                 showNotification('Você precisa estar logado para gerenciar obras.', 'error');
                 return;
            }

            // 1. Coleta e Limpeza dos Dados
            const rawCnpjCpf = document.getElementById('cnpjCpf').value;
            const rawCep = document.getElementById('cep').value;
           
            const constructionData = {
                cnpjCpf: cleanCnpjCpf(rawCnpjCpf),
                nomeObra: document.getElementById('nomeObra').value,
                localObra: document.getElementById('localObra').value,
                cep: cleanCep(rawCep),
                dataInicio: document.getElementById('dataInicio').value,
                previsaoTermino: document.getElementById('previsaoTermino').value || null
                // Status e Progresso podem ser adicionados aqui se forem editáveis no form
            };
           
            // 2. Define o método e o URL com base no ID
            const isEditing = !!obraId;
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_BASE_URL}/${obraId}` : `${API_BASE_URL}/register`;
            const successMessage = isEditing ? 'atualizada' : 'cadastrada';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(constructionData)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification(`Obra "${result.construction.nomeObra}" ${successMessage} com sucesso!`, 'success');
                   
                    // Limpa e reseta o formulário
                    resetFormToRegisterMode();
                   
                    // Recarrega a lista
                    fetchUserConstructions();
                } else {
                    showNotification(`Erro na ${successMessage}: ${result.message || 'Verifique se todos os campos estão corretos.'}`, 'error', 5000);
                }
            } catch (error) {
                console.error('Erro na comunicação com o servidor:', error);
                showNotification('Erro ao conectar com o servidor. Verifique sua conexão e se o Node.js está rodando.', 'error', 5000);
            }
        });
    }

    // Chamada inicial para carregar as obras quando a página carrega
    fetchUserConstructions();
});