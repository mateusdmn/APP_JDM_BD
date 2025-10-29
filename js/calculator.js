document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Calculadora de Materiais Essenciais carregada!');

    const calcTabButtons = document.querySelectorAll('.calc-tab-btn');
    const calculationSections = document.querySelectorAll('.calculation-section');

    // --- Lógica para alternar entre as abas de cálculo ---
    calcTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'active' de todas as abas
            calcTabButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona 'active' à aba clicada
            this.classList.add('active');

            // Esconde todas as seções de cálculo
            calculationSections.forEach(section => section.classList.remove('active'));
            // Mostra a seção correspondente à aba clicada
            const targetSectionId = this.dataset.target;
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Opcional: Limpa resultados ao trocar de aba para evitar confusão
            document.querySelectorAll('.calculation-results').forEach(resultsDiv => {
                resultsDiv.innerHTML = '';
            });
        });
    });

    // --- 1. Cálculo para Concreto (Laje/Piso) ---
    const concreteForm = document.getElementById('concreteForm');
    const concVolumeInput = document.getElementById('concVolume');
    const concRatioSelect = document.getElementById('concRatio');
    const concreteResultsDiv = document.getElementById('concreteResults');

    if (concreteForm) {
        concreteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const volume = parseFloat(concVolumeInput.value);
            const ratio = concRatioSelect.value;

            if (isNaN(volume) || volume <= 0) {
                concreteResultsDiv.innerHTML = '<p class="error-message">Por favor, insira um volume válido (número maior que zero).</p>';
                return;
            }

            let cimentoPorM3Kg = 0;
            let areiaPorM3M3 = 0;
            let britaPorM3M3 = 0;
            let aguaPorM3Litros = 0;

            // Valores médios por m³ de concreto (ajuste conforme o traço e região)
            // Estes são valores de referência. Em obras reais, traços específicos são usados.
            switch (ratio) {
                case '1:2:3': // fck 20 MPa
                    cimentoPorM3Kg = 350; // ~7 sacos de 50kg
                    areiaPorM3M3 = 0.55;
                    britaPorM3M3 = 0.85;
                    aguaPorM3Litros = 200;
                    break;
                case '1:2.5:3.5': // fck 15 MPa
                    cimentoPorM3Kg = 280; // ~5.6 sacos de 50kg
                    areiaPorM3M3 = 0.60;
                    britaPorM3M3 = 0.90;
                    aguaPorM3Litros = 210;
                    break;
                case '1:1.5:3': // fck 25 MPa
                    cimentoPorM3Kg = 400; // ~8 sacos de 50kg
                    areiaPorM3M3 = 0.50;
                    britaPorM3M3 = 0.80;
                    aguaPorM3Litros = 180;
                    break;
                default:
                    concreteResultsDiv.innerHTML = '<p class="error-message">Traço de concreto não reconhecido.</p>';
                    return;
            }

            // Cálculos
            const cimentoKg = volume * cimentoPorM3Kg;
            const cimentoSacos = Math.ceil(cimentoKg / 50); // Sacos de 50kg
            const areiaM3 = volume * areiaPorM3M3;
            const britaM3 = volume * britaPorM3M3;
            const aguaLitros = volume * aguaPorM3Litros;

            concreteResultsDiv.innerHTML = `
                <h4>Resultados do Cálculo para Concreto (${ratio})</h4>
                <ul>
                    <li>Volume de Concreto: <strong>${volume.toFixed(2)} m³</strong></li>
                    <li>Cimento (50kg): <strong>${cimentoSacos} sacos</strong> (${cimentoKg.toFixed(1)} kg)</li>
                    <li>Areia: <strong>${areiaM3.toFixed(2)} m³</strong></li>
                    <li>Brita: <strong>${britaM3.toFixed(2)} m³</strong></li>
                    <li>Água: <strong>${aguaLitros.toFixed(1)} litros</strong></li>
                </ul>
                <p style="font-size:0.85rem; color:#777; margin-top:15px;">*Os valores são estimativas e podem variar conforme o traço exato, aditivos e tipo de material. Adicione uma margem de segurança (5-10%).</p>
            `;
        });
    }

    // --- 2. Cálculo para Alvenaria ---
    const masonryForm = document.getElementById('masonryForm');
    const masonryAreaInput = document.getElementById('masonryArea');
    const brickTypeSelect = document.getElementById('brickType');
    const mortarThicknessInput = document.getElementById('mortarThickness');
    const masonryResultsDiv = document.getElementById('masonryResults');

    if (masonryForm) {
        masonryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const area = parseFloat(masonryAreaInput.value);
            const brickType = brickTypeSelect.value;
            const mortarThicknessCm = parseFloat(mortarThicknessInput.value); // cm

            if (isNaN(area) || area <= 0 || !brickType || isNaN(mortarThicknessCm) || mortarThicknessCm <= 0) {
                masonryResultsDiv.innerHTML = '<p class="error-message">Por favor, insira uma área válida, selecione o tipo de tijolo/bloco e a espessura da junta.</p>';
                return;
            }

            let tijolosPorM2Base = 0; // Quantidade de tijolos/blocos por m² sem considerar junta
            let argamassaPorM2LitrosBase = 0; // Litros de argamassa por m² para junta padrão
            const perdaTijolo = 1.05; // 5% de perda/quebra
            const perdaArgamassa = 1.10; // 10% de perda

            // Dimensões do tijolo/bloco (Comprimento x Altura, em metros) e consumo de argamassa (litros/m²)
            const brickData = {
                'ceramic_6_hole': { dim: [0.19, 0.19], argamassaBase: 15 }, // 9x19x19cm
                'ceramic_8_hole': { dim: [0.29, 0.19], argamassaBase: 18 }, // 9x19x29cm
                'concrete_14x19x39': { dim: [0.39, 0.19], argamassaBase: 22 }, // 14x19x39cm
                'concrete_9x19x39': { dim: [0.39, 0.19], argamassaBase: 18 } // 9x19x39cm
            };

            if (!brickData[brickType]) {
                masonryResultsDiv.innerHTML = '<p class="error-message">Tipo de tijolo/bloco não reconhecido.</p>';
                return;
            }

            const brickLength = brickData[brickType].dim[0];
            const brickHeight = brickData[brickType].dim[1];
            const argamassaBase = brickData[brickType].argamassaBase;

            // Cálculo de tijolos por m² com base na junta
            // Área efetiva do tijolo + junta
            const effectiveLength = brickLength + (mortarThicknessCm / 100);
            const effectiveHeight = brickHeight + (mortarThicknessCm / 100);
            tijolosPorM2Base = 1 / (effectiveLength * effectiveHeight);

            // Ajuste da argamassa de assentamento com base na espessura da junta
            // Este é um cálculo mais complexo e pode exigir simplificação ou tabelas
            // Aqui, usamos um fator de ajuste simples baseado na espessura padrão (1.5cm)
            const defaultMortarThicknessCm = 1.5;
            argamassaPorM2LitrosBase = argamassaBase * (mortarThicknessCm / defaultMortarThicknessCm);


            // Cálculos Finais
            const totalTijolos = Math.ceil(area * tijolosPorM2Base * perdaTijolo);
            const totalArgamassaLitros = area * argamassaPorM2LitrosBase * perdaArgamassa;
            const totalArgamassaSacos = Math.ceil(totalArgamassaLitros / 20); // Considerando sacos de argamassa de 20 litros/kg

            masonryResultsDiv.innerHTML = `
                <h4>Resultados do Cálculo para Alvenaria</h4>
                <ul>
                    <li>Área da Parede: <strong>${area.toFixed(2)} m²</strong></li>
                    <li>Tipo de ${brickTypeSelect.options[brickTypeSelect.selectedIndex].text}</li>
                    <li>Junta de Argamassa: <strong>${mortarThicknessCm.toFixed(1)} cm</strong></li>
                    <li>Quantidade de Tijolos/Blocos: <strong>${totalTijolos} unidades</strong></li>
                    <li>Argamassa de Assentamento: <strong>${totalArgamassaSacos} sacos</strong> (${totalArgamassaLitros.toFixed(1)} litros)</li>
                </ul>
                <p style="font-size:0.85rem; color:#777; margin-top:15px;">*Valores aproximados, considerando perdas e espessura da junta. Consulte um profissional.</p>
            `;
        });
    }

    // --- 3. Cálculo para Reboco/Chapisco ---
    const plasteringForm = document.getElementById('plasteringForm');
    const plasteringAreaInput = document.getElementById('plasteringArea');
    const plasteringTypeSelect = document.getElementById('plasteringType');
    const plasteringResultsDiv = document.getElementById('plasteringResults');

    if (plasteringForm) {
        plasteringForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const area = parseFloat(plasteringAreaInput.value);
            const type = plasteringTypeSelect.value;

            if (isNaN(area) || area <= 0 || !type) {
                plasteringResultsDiv.innerHTML = '<p class="error-message">Por favor, insira uma área válida e selecione o tipo de material.</p>';
                return;
            }

            let cimentoKgPorM2 = 0;
            let areiaM3PorM2 = 0;
            let calKgPorM2 = 0; // Cal hidratada
            const perdaArgamassaReboco = 1.15; // 15% de perda

            // Consumos médios por m² para argamassas (ajuste conforme traço local)
            switch (type) {
                case 'chapisco': // Traço 1:3 (cimento:areia) - 2-3mm espessura
                    cimentoKgPorM2 = 1.2;
                    areiaM3PorM2 = 0.003;
                    break;
                case 'embozo': // Traço 1:2:8 (cimento:cal:areia) - 1.5-2.5cm espessura
                    cimentoKgPorM2 = 2.5;
                    calKgPorM2 = 1.5;
                    areiaM3PorM2 = 0.02;
                    break;
                case 'reboco': // Traço 1:2:8 (cimento:cal:areia) - 0.5-1.5cm espessura
                    cimentoKgPorM2 = 1.8;
                    calKgPorM2 = 1.0;
                    areiaM3PorM2 = 0.012;
                    break;
                default:
                    plasteringResultsDiv.innerHTML = '<p class="error-message">Tipo de material não reconhecido.</p>';
                    return;
            }

            // Cálculos
            const totalCimentoKg = area * cimentoKgPorM2 * perdaArgamassaReboco;
            const totalCimentoSacos = Math.ceil(totalCimentoKg / 50);
            const totalAreiaM3 = area * areiaM3PorM2 * perdaArgamassaReboco;
            const totalCalKg = area * calKgPorM2 * perdaArgamassaReboco;
            const totalCalSacos = Math.ceil(totalCalKg / 20); // Cal em sacos de 20kg

            plasteringResultsDiv.innerHTML = `
                <h4>Resultados do Cálculo para ${plasteringTypeSelect.options[plasteringTypeSelect.selectedIndex].text}</h4>
                <ul>
                    <li>Área da Parede: <strong>${area.toFixed(2)} m²</strong></li>
                    <li>Cimento (50kg): <strong>${totalCimentoSacos} sacos</strong> (${totalCimentoKg.toFixed(1)} kg)</li>
                    <li>Areia: <strong>${totalAreiaM3.toFixed(2)} m³</strong></li>
                    ${type !== 'chapisco' ? `<li>Cal Hidratada (20kg): <strong>${totalCalSacos} sacos</strong> (${totalCalKg.toFixed(1)} kg)</li>` : ''}
                </ul>
                <p style="font-size:0.85rem; color:#777; margin-top:15px;">*Valores aproximados. A perda pode variar significativamente com a experiência do profissional.</p>
            `;
        });
    }

    // --- 4. Cálculo para Pintura ---
    const paintingForm = document.getElementById('paintingForm');
    const paintingAreaInput = document.getElementById('paintingArea');
    const coatsInput = document.getElementById('coats');
    const paintYieldInput = document.getElementById('paintYield');
    const paintingResultsDiv = document.getElementById('paintingResults');

    if (paintingForm) {
        paintingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const area = parseFloat(paintingAreaInput.value);
            const coats = parseInt(coatsInput.value);
            const paintYield = parseFloat(paintYieldInput.value);

            if (isNaN(area) || area <= 0 || isNaN(coats) || coats <= 0 || isNaN(paintYield) || paintYield <= 0) {
                paintingResultsDiv.innerHTML = '<p class="error-message">Por favor, insira valores válidos para área, demãos e rendimento da tinta.</p>';
                return;
            }

            // Cálculo do consumo total de tinta
            const totalPaintNeededLitros = (area * coats) / paintYield;
            const galoes18L = Math.ceil(totalPaintNeededLitros / 18);
            const latas3_6L = Math.ceil((totalPaintNeededLitros % 18) / 3.6); // Para calcular o restante em latas menores

            paintingResultsDiv.innerHTML = `
                <h4>Resultados do Cálculo para Pintura</h4>
                <ul>
                    <li>Área a Ser Pintada: <strong>${area.toFixed(2)} m²</strong></li>
                    <li>Demãos: <strong>${coats}</strong></li>
                    <li>Rendimento da Tinta: <strong>${paintYield.toFixed(1)} m²/litro/demão</strong></li>
                    <li>Tinta Necessária: <strong>${totalPaintNeededLitros.toFixed(2)} litros</strong></li>
                    <li>Sugestão de Compra: <strong>${galoes18L} galão(ões) de 18L</strong> e <strong>${latas3_6L} lata(s) de 3.6L</strong></li>
                </ul>
                <p style="font-size:0.85rem; color:#777; margin-top:15px;">*O rendimento da tinta varia conforme a marca, tipo de superfície e diluição. Sempre arredonde para mais.</p>
            `;
        });
    }
});