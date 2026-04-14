// Efeito de revelação ao rolar a página
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-partner');
            }
        });
    }, { threshold: 0.1 });

    const partners = document.querySelectorAll('.partner-logo');
    partners.forEach(el => observer.observe(el));
});