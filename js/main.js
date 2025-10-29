// --- Variáveis Globais de Firebase (MANDATÓRIO) ---
// Estas variáveis são necessárias para a infraestrutura do Canvas, mesmo que o Firebase não esteja sendo usado diretamente neste arquivo.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------------------------
    // --- Lógica de Verificação de Usuário e Atualização de Nome (MANUTENÇÃO) ---
    // ----------------------------------------------------------------------
    const currentUser = JSON.parse(localStorage.getItem('jdm_currentUser')); 
    
    const userNameHeader = document.getElementById('userName');
    const userNameWelcome = document.querySelector('.welcome-user-name');

    if (currentUser && currentUser.name) { 
        const firstName = currentUser.name.split(' ')[0];
        if (userNameHeader) {
            userNameHeader.textContent = firstName;
        }
        if (userNameWelcome) {
            userNameWelcome.textContent = firstName;
        }
    } else {
        if (userNameHeader) {
            userNameHeader.textContent = 'Visitante';
        }
        if (userNameWelcome) {
            userNameWelcome.textContent = 'Usuário'; 
        }
    }

    // ----------------------------------------------------------------------
    // --- Lógica do Menu Interativo (MANUTENÇÃO) ---
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeMenu);
    }
    overlay.addEventListener('click', closeMenu);

    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li a');
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            closeMenu();
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            closeMenu();
        }
    });

    // Lógica para destacar o item de menu ativo (active)
    function highlightActiveMenuItem() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        const menuLinks = document.querySelectorAll('.sidebar-menu a');

        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === filename) {
                link.classList.add('active');
            } else if (filename === '' && link.getAttribute('href') === 'app.html') {
                link.classList.add('active');
            }
        });
    }
    highlightActiveMenuItem();
    
    // ----------------------------------------------------------------------
    // --- Lógica de Logout (MANUTENÇÃO) ---
    // ----------------------------------------------------------------------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('jdm_currentUser'); 
            localStorage.removeItem('jdm_token'); 
            window.location.href = 'index.html';
        });
    }

    // ----------------------------------------------------------------------
    // --- Inicialização dos Gráficos ---
    // ----------------------------------------------------------------------
    initCharts();
});

// --------------------------------------------------------------------------
// --- Funções de Gráficos usando CHART.JS ---
// --------------------------------------------------------------------------

function initCharts() {
    // Dados de exemplo para o Gráfico de Barras (Consumo de Materiais)
    const materialsData = [
        { name: 'Cimento', value: 120, color: '#FFA500' }, 
        { name: 'Tijolos', value: 85, color: '#FF8C00' },  
        { name: 'Areia', value: 45, color: '#FF7F50' },   
        { name: 'Aço', value: 65, color: '#FF4500' }      
    ];
    
    // Dados de exemplo para o Gráfico de Rosca (Progresso da Obra)
    const progressData = [
        { name: 'Concluído', value: 65, color: '#34D399' }, 
        { name: 'Em Andamento', value: 20, color: '#FB923C' }, 
        { name: 'Pendente', value: 15, color: '#F87171' } 
    ];

    renderColumnChart('materialsChart', materialsData);
    // Renderiza o novo Gráfico de Progresso da Obra
    renderDoughnutChart('progressChart', progressData); 
}

/**
 * Renderiza um Gráfico de Barras (Column Chart) usando Chart.js
 * @param {string} containerId ID do elemento canvas onde o gráfico será renderizado.
 * @param {Array<Object>} data Array de objetos com { name: string, value: number, color: string }.
 */
function renderColumnChart(containerId, data) {
    const ctx = document.getElementById(containerId);
    
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Consumo (unidades/sacos)',
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                borderColor: data.map(item => item.color),
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // ESSENCIAL: Permite que o CSS controle o tamanho
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Renderiza um Gráfico de Rosca (Doughnut Chart) - Ideal para Progresso.
 * @param {string} containerId ID do elemento canvas.
 * @param {Array<Object>} data Array de objetos com { name: string, value: number, color: string }.
 */
function renderDoughnutChart(containerId, data) {
    const ctx = document.getElementById(containerId);
    
    if (!ctx || typeof Chart === 'undefined') return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.value),
                backgroundColor: data.map(item => item.color),
                borderColor: '#ffffff',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // ESSENCIAL: Permite que o CSS controle o tamanho
            cutout: '70%', // Define a espessura da rosca
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (context.parsed !== null) {
                                // Exibe o valor como porcentagem
                                label += `: ${context.parsed}%`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
