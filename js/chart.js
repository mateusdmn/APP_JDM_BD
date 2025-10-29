document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.createElement('div'); // Criar o overlay
    overlay.className = 'overlay';
    document.body.appendChild(overlay); // Adicionar o overlay ao body
    const logoutBtn = document.getElementById('logoutBtn');

    // Verificar usuário logado e exibir nome
    const currentUser = JSON.parse(sessionStorage.getItem('jdm_currentUser'));
    const userNameElements = document.querySelectorAll('#userName'); // Seleciona ambos os spans com id="userName"
    
    if (currentUser) { // A verificação de redirecionamento principal é feita em auth.js
        userNameElements.forEach(element => {
            element.textContent = currentUser.name.split(' ')[0]; // Exibe apenas o primeiro nome
        });
    } else {
        // Redirecionamento de segurança, embora auth.js deva lidar com isso primeiro
        window.location.href = 'index.html';
    }

    // Função para abrir o menu
    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita scroll no body quando o menu está aberto
    }

    // Função para fechar o menu
    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaura o scroll do body
    }

    // Menu toggle (botão do hambúrguer)
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }

    // Fechar menu (botão X na sidebar e clique no overlay)
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeMenu);
    }
    overlay.addEventListener('click', closeMenu);

    // Fechar menu ao clicar em um item (opcional, para navegação em mobile)
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Adicione aqui a lógica de navegação se for SPA, ou o href já vai redirecionar
            closeMenu(); 
        });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('jdm_currentUser');
            window.location.href = 'index.html';
        });
    }

    // Fechar menu automaticamente em telas maiores que 992px
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            closeMenu();
        }
    });

    // Inicializar gráficos
    initCharts();
});

// --- Lógica dos Gráficos (antigo chart.js) ---

function initCharts() {
    // Dados dos materiais
    const materialsData = [
        { name: 'Cimento', value: 120, color: '#FFA500' },
        { name: 'Tijolos', value: 850, color: '#FF8C00' },
        { name: 'Areia', value: 45, color: '#FF7F50' },
        { name: 'Pedra', value: 30, color: '#FF6347' },
        { name: 'Aço', value: 65, color: '#FF4500' }
    ];

    renderColumnChart('materialsChart', materialsData); // Renomeado para refletir o tipo de gráfico
    renderPieChart('progressChart', 65, 20, 15);
}

// Função para renderizar gráfico de COLUNAS (Consumo de Materiais)
function renderColumnChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Limpa o conteúdo anterior

    const maxValue = Math.max(...data.map(item => item.value));
    const chartHeightPx = 200; // Altura fixa para o gráfico em pixels

    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    
    const barsContainer = document.createElement('div');
    barsContainer.className = 'bars-container';
    
    data.forEach(item => {
        // Altura da barra proporcional ao valor, usando uma variável CSS para animação
        const barHeightPercentage = (item.value / maxValue) * 100; 
        
        const barElement = document.createElement('div');
        barElement.className = 'bar-element';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.backgroundColor = item.color; // Cor definida nos dados
        bar.style.setProperty('--final-height', `${barHeightPercentage}%`); // Usar custom property para animação
        
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = item.value;
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = item.name;
        
        bar.appendChild(barValue);
        barElement.appendChild(bar);
        barElement.appendChild(barLabel);
        barsContainer.appendChild(barElement);
    });
    
    chartWrapper.appendChild(barsContainer);
    container.appendChild(chartWrapper);
}

// Função para renderizar gráfico de PIZZA (Progresso da Obra) - mantida a sua implementação original
function renderPieChart(containerId, completed, inProgress, pending) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    const total = completed + inProgress + pending;
    const chartSize = 200;
    
    const pieChart = document.createElement('div');
    pieChart.className = 'pie-chart';
    pieChart.style.width = `${chartSize}px`;
    pieChart.style.height = `${chartSize}px`;
    
    const pieSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pieSvg.setAttribute('viewBox', `0 0 ${chartSize} ${chartSize}`);
    
    // Cálculo dos ângulos
    const completedAngle = (completed / total) * 360;
    const inProgressAngle = (inProgress / total) * 360;
    
    // Círculo completo de fundo
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', chartSize/2);
    bgCircle.setAttribute('cy', chartSize/2);
    bgCircle.setAttribute('r', chartSize/2 - 10);
    bgCircle.setAttribute('fill', '#f5f5f5');
    pieSvg.appendChild(bgCircle);
    
    // Segmento concluído
    const completedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    completedPath.setAttribute('d', describeArc(chartSize/2, chartSize/2, chartSize/2 - 10, 0, completedAngle));
    completedPath.setAttribute('fill', '#FFA500');
    pieSvg.appendChild(completedPath);
    
    // Segmento em progresso
    const inProgressPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    inProgressPath.setAttribute('d', describeArc(chartSize/2, chartSize/2, chartSize/2 - 10, completedAngle, completedAngle + inProgressAngle));
    inProgressPath.setAttribute('fill', '#FF8C00');
    pieSvg.appendChild(inProgressPath);
    
    // Texto central
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', chartSize/2);
    text.setAttribute('y', chartSize/2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '24');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#333');
    text.textContent = `${completed}%`;
    pieSvg.appendChild(text);
    
    pieChart.appendChild(pieSvg);
    
    // Legenda
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    
    const legendItems = [
        { color: '#FFA500', label: `Concluído (${completed}%)` },
        { color: '#FF8C00', label: `Em Andamento (${inProgress}%)` },
        { color: '#FF6347', label: `Pendente (${pending}%)` }
    ];
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = item.color;
        
        const label = document.createElement('span');
        label.textContent = item.label;
        
        legendItem.appendChild(color);
        legendItem.appendChild(label);
        legend.appendChild(legendItem);
    });
    
    container.appendChild(pieChart);
    container.appendChild(legend);
}

// Função auxiliar para criar arcos SVG
function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
        "M", x, y,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "Z"
    ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}