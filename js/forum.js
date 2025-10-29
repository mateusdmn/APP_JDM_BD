document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Fórum de Dúvidas carregada!');

    const askQuestionForm = document.getElementById('askQuestionForm');
    const questionEmailInput = document.getElementById('questionEmail');
    const questionTextInput = document.getElementById('questionText');
    const questionsList = document.getElementById('questionsList');

    // Função para adicionar uma nova pergunta à lista (simulação)
    function addNewQuestion(email, question) {
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
        }); // Ex: "10:30, 2 jun."

        const newQuestionItem = document.createElement('div');
        newQuestionItem.classList.add('question-item');
        newQuestionItem.innerHTML = `
            <div class="question-header">
                <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
                <span class="user-name">${email.split('@')[0]}</span>
                <span class="question-date">${dateString}</span>
            </div>
            <p class="question-text">${question}</p>
            <div class="question-actions">
                <button class="answer-btn"><i class="fas fa-reply"></i> Responder</button>
                <button class="view-answers-btn"><i class="fas fa-eye"></i> Ver Respostas (0)</button>
            </div>
            <div class="answers-container">
                </div>
        `;
        // Adiciona a nova pergunta no TOPO da lista
        questionsList.prepend(newQuestionItem);
    }

    // Função para adicionar uma resposta a uma pergunta
    function addAnswerToQuestion(answersContainer, userName, answerText) {
        const answerItem = document.createElement('div');
        answerItem.classList.add('answer-item');
        answerItem.innerHTML = `
            <span class="user-name">${userName}</span>
            <p>${answerText}</p>
        `;
        answersContainer.appendChild(answerItem);
    }

    // Lógica para submeter o formulário de nova pergunta
    if (askQuestionForm) {
        askQuestionForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = questionEmailInput.value;
            const question = questionTextInput.value;

            if (email && question) {
                console.log('Nova Dúvida Enviada:', { email, question });
                addNewQuestion(email, question);

                questionEmailInput.value = '';
                questionTextInput.value = '';

                // Opcional: exibir uma notificação de sucesso
                // showNotification('Sua dúvida foi enviada com sucesso!', 'success', 3000);
            } else {
                alert('Por favor, preencha o email e a dúvida.');
            }
        });
    }

    // Lógica para botões de "Ver Respostas" e "Responder" usando event delegation
    if (questionsList) {
        questionsList.addEventListener('click', function(e) {
            const target = e.target;

            // Lógica para o botão "Ver Respostas"
            if (target.closest('.view-answers-btn')) {
                const viewBtn = target.closest('.view-answers-btn');
                const questionItem = viewBtn.closest('.question-item');
                const answersContainer = questionItem.querySelector('.answers-container');

                if (answersContainer) {
                    answersContainer.classList.toggle('show'); // Alterna visibilidade do container de respostas
                    if (answersContainer.classList.contains('show')) {
                        // Se o container está sendo mostrado e não tem respostas (apenas para o exemplo estático)
                        if (answersContainer.children.length === 0 || answersContainer.children[0].classList.contains('answer-form')) {
                            // Carrega respostas de exemplo se não houver ou se o form de resposta estiver lá
                            answersContainer.innerHTML = `
                                <div class="answer-item">
                                    <span class="user-name">Usuário Resposta 1</span>
                                    <p>Essa é uma ótima pergunta! Para porcelanato externo, recomendo argamassa ACIII, que oferece maior resistência à água e variações de temperatura.</p>
                                </div>
                                <div class="answer-item">
                                    <span class="user-name">Usuário Resposta 2</span>
                                    <p>Concordo com a ACIII. E lembre-se de preparar bem o contrapiso e usar espaçadores adequados.</p>
                                </div>
                                `;
                        }
                        viewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Esconder Respostas';
                    } else {
                        viewBtn.innerHTML = '<i class="fas fa-eye"></i> Ver Respostas (3)'; // Hardcoded para o exemplo
                    }
                }
            }

            // Lógica para o botão "Responder"
            if (target.closest('.answer-btn')) {
                const answerBtn = target.closest('.answer-btn');
                const questionItem = answerBtn.closest('.question-item');
                const answersContainer = questionItem.querySelector('.answers-container');
                
                // Abre/fecha o container de respostas se ele estiver fechado
                if (!answersContainer.classList.contains('show')) {
                    answersContainer.classList.add('show');
                    questionItem.querySelector('.view-answers-btn').innerHTML = '<i class="fas fa-eye-slash"></i> Esconder Respostas';
                }

                // Verifica se já existe um formulário de resposta para evitar duplicação
                let existingAnswerForm = answersContainer.querySelector('.answer-form');
                if (existingAnswerForm) {
                    // Se já existe, apenas alterna a visibilidade
                    existingAnswerForm.classList.toggle('show');
                    if (existingAnswerForm.classList.contains('show')) {
                        answerBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Resposta';
                    } else {
                        answerBtn.innerHTML = '<i class="fas fa-reply"></i> Responder';
                    }
                    return; // Sai da função após alternar
                }

                // Cria o formulário de resposta
                const answerForm = document.createElement('form');
                answerForm.classList.add('answer-form', 'show'); // Inicia visível
                answerForm.innerHTML = `
                    <textarea placeholder="Digite sua resposta aqui..." rows="3" required></textarea>
                    <button type="submit" class="submit-answer-btn"><i class="fas fa-paper-plane"></i> Enviar Resposta</button>
                `;
                answersContainer.appendChild(answerForm);

                // Muda o texto do botão "Responder" para "Fechar Resposta"
                answerBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Resposta';

                // Adiciona o listener para o formulário de resposta recém-criado
                answerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const answerTextarea = answerForm.querySelector('textarea');
                    const answerContent = answerTextarea.value.trim();

                    if (answerContent) {
                        // Simulação de nome de usuário (em um app real viria do usuário logado)
                        const currentUserName = document.getElementById('userName').textContent || 'Você';
                        
                        addAnswerToQuestion(answersContainer, currentUserName, answerContent);
                        answerTextarea.value = ''; // Limpa o campo

                        // Opcional: Notificação de sucesso da resposta
                        // showNotification('Sua resposta foi enviada!', 'success', 2000);

                        // Fecha o campo de resposta após o envio
                        answerForm.classList.remove('show');
                        answerBtn.innerHTML = '<i class="fas fa-reply"></i> Responder';
                    } else {
                        alert('Por favor, digite sua resposta.');
                    }
                });
            }
        });
    }

    // Se a função showNotification estiver em main.js ou outro arquivo, certifique-se que está carregado.
    // Caso contrário, você pode copiá-la para cá.
    // Exemplo (se não estiver em outro lugar):
    // function showNotification(message, type = 'success', duration = 3000) { ... }
});