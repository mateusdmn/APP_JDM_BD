document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Notificações carregada!');

    const notificationList = document.getElementById('notificationList');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Simulação de dados de notificações
    let notifications = [
        {
            id: 1,
            type: 'warning',
            heading: 'Atenção: Atraso na Entrega de Cimento!',
            text: 'A entrega de cimento para a obra \'Residencial Alphaville\' foi adiada em 2 dias. Verifique o novo prazo.',
            time: '10 min atrás',
            status: 'unread',
            important: true
        },
        {
            id: 2,
            type: 'success',
            heading: 'Obra \'Green Valley\' Concluída!',
            text: 'Parabéns! A obra \'Residencial Green Valley\' foi finalizada com sucesso. Acesse o relatório completo.',
            time: '1 dia atrás',
            status: 'read',
            important: false
        },
        {
            id: 3,
            type: 'info',
            heading: 'Nova Dica: Economia de Materiais',
            text: 'Confira nossa nova dica na Seção Educativa sobre como otimizar o uso de materiais e reduzir desperdícios.',
            time: '2 dias atrás',
            status: 'unread',
            important: false
        },
        {
            id: 4,
            type: 'event',
            heading: 'Lembrete: Reunião de Projeto',
            text: 'Reunião agendada para amanhã, 03/06, às 14:00, para discutir o progresso da obra \'Porto Seguro\'.',
            time: '3 dias atrás',
            status: 'read',
            important: true
        },
        {
            id: 5,
            type: 'info',
            heading: 'Atualização de Sistema',
            text: 'Uma nova versão do sistema JDM está disponível com melhorias de performance e novas funcionalidades.',
            time: '4 dias atrás',
            status: 'unread',
            important: false
        },
        {
            id: 6,
            type: 'warning',
            heading: 'Baixo Estoque: Vergalhões',
            text: 'O estoque de vergalhões na obra \'Cidade Jardim\' está abaixo do nível mínimo. Faça um novo pedido.',
            time: '5 dias atrás',
            status: 'unread',
            important: true
        }
    ];

    // Mapeamento de tipo de notificação para ícone Font Awesome
    const notificationIcons = {
        'warning': 'fas fa-exclamation-triangle',
        'success': 'fas fa-check-circle',
        'info': 'fas fa-lightbulb', // Ou fas fa-info-circle
        'event': 'fas fa-calendar-alt',
        'default': 'fas fa-bell'
    };

    // Função para renderizar as notificações
    function renderNotifications(filter = 'all') {
        notificationList.innerHTML = ''; // Limpa a lista existente

        const filteredNotifications = notifications.filter(notification => {
            if (filter === 'all') return true;
            if (filter === 'unread') return notification.status === 'unread';
            if (filter === 'important') return notification.important;
            return false;
        });

        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = '<p class="no-notifications-message">Nenhuma notificação encontrada para este filtro.</p>';
            return;
        }

        filteredNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.classList.add('notification-item', notification.status);
            if (notification.important) {
                notificationItem.classList.add('important');
            }
            notificationItem.dataset.id = notification.id; // Para identificar a notificação

            const iconClass = notificationIcons[notification.type] || notificationIcons['default'];

            notificationItem.innerHTML = `
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <h4 class="notification-heading">${notification.heading}</h4>
                    <p class="notification-text">${notification.text}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
                <div class="notification-actions">
                    <button class="${notification.status === 'read' ? 'mark-as-unread-btn' : 'mark-as-read-btn'}" 
                            title="${notification.status === 'read' ? 'Marcar como não lida' : 'Marcar como lida'}">
                        <i class="fas ${notification.status === 'read' ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                    </button>
                    <button class="delete-notification-btn" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            `;
            notificationList.appendChild(notificationItem);
        });
    }

    // Lógica para as abas de filtro
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'active' de todas as abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona 'active' à aba clicada
            this.classList.add('active');
            // Renderiza as notificações com o filtro selecionado
            renderNotifications(this.dataset.tab);
        });
    });

    // Lógica para ações nas notificações (marcar como lida/não lida, excluir)
    notificationList.addEventListener('click', function(e) {
        const target = e.target;
        const notificationItem = target.closest('.notification-item');
        if (!notificationItem) return; // Se o clique não foi em um item de notificação

        const notificationId = parseInt(notificationItem.dataset.id);
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);

        if (notificationIndex === -1) return; // Notificação não encontrada

        // Marcar como lida/não lida
        if (target.closest('.mark-as-read-btn') || target.closest('.mark-as-unread-btn')) {
            const currentStatus = notifications[notificationIndex].status;
            notifications[notificationIndex].status = currentStatus === 'read' ? 'unread' : 'read';
            renderNotifications(document.querySelector('.tab-btn.active').dataset.tab); // Re-renderiza com o filtro atual
        }

        // Excluir notificação
        if (target.closest('.delete-notification-btn')) {
            if (confirm('Tem certeza que deseja excluir esta notificação?')) {
                notifications.splice(notificationIndex, 1); // Remove do array
                renderNotifications(document.querySelector('.tab-btn.active').dataset.tab); // Re-renderiza
            }
        }
    });

    // Renderiza as notificações iniciais ao carregar a página
    renderNotifications('all');
});