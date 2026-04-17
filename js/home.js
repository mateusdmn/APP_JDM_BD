/**
 * Lógica do Carrossel JDM
 * Inclui: Movimentação manual, automática e pause ao passar o mouse.
 */
window.onload = function() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slides = document.querySelectorAll('.carousel-slide');
    
    // Verifica se os elementos existem para não dar erro no console
    if (!track || slides.length === 0 || !prevBtn || !nextBtn) {
        console.error("Erro: Elementos do carrossel não encontrados.");
        return;
    }

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer;

    // Função que aplica o movimento
    function updateCarousel() {
        const offset = currentIndex * -100;
        track.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    // Iniciar Automático (6 segundos para dar tempo de ler o banner)
    function startAutoPlay() {
        stopAutoPlay(); 
        autoPlayTimer = setInterval(nextSlide, 3000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayTimer);
    }

    // Eventos de Clique
    nextBtn.onclick = function() {
        nextSlide();
        startAutoPlay(); // Reinicia o timer para não pular rápido logo após o clique
    };

    prevBtn.onclick = function() {
        prevSlide();
        startAutoPlay();
    };

    // Pausar automático se o mouse estiver em cima da imagem
    track.onmouseenter = stopAutoPlay;
    track.onmouseleave = startAutoPlay;

    // Início imediato do carrossel
    startAutoPlay();
};