document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const numbersContainer = document.getElementById('numbers-container');
    const personNameInput = document.getElementById('person-name');
    const addButton = document.getElementById('add-button');
    const clearButton = document.getElementById('clear-button');
    const resultsList = document.getElementById('results-list');
    const sorteoButton = document.getElementById('sorteo-button');
    const sorteo3Button = document.getElementById('sorteo-3-button');
    const winnerDisplay = document.getElementById('winner-display');
    const winnerSingleDisplay = document.getElementById('winner-single');
    const winnerTop3Display = document.getElementById('winner-top3');
    const countdownTimer = document.getElementById('countdown-timer');
    const winnerNumberEl = document.getElementById('winner-number');
    const winnerNameEl = document.getElementById('winner-name');
    const winnerListTop3El = document.getElementById('winner-list-top3');
    const add10Button = document.getElementById('add-10-button');
    const remove10Button = document.getElementById('remove-10-button');
    const exportButton = document.getElementById('export-json-button');
    const importButton = document.getElementById('import-json-button');
    const fileInput = document.getElementById('import-file-input');
    const themeSelector = document.getElementById('theme-selector');
    const body = document.body;

    // --- App State ---
    let participants = [];
    let selectedNumbers = [];
    let maxNumbers = 100;
    let matrixInterval;

    // --- Core Functions ---
    function initializeApp() {
        const savedParticipants = localStorage.getItem('raffleParticipants');
        if (savedParticipants) {
            participants = JSON.parse(savedParticipants);
        }
        const savedMaxNumbers = localStorage.getItem('raffleMaxNumbers');
        if (savedMaxNumbers) {
            maxNumbers = parseInt(savedMaxNumbers, 10);
        }
        generateNumberGrid();
        renderParticipants();
        updateAssignedNumbers();
        loadTheme();
        initializeVisitorCounter();
    }

    function generateNumberGrid() {
        if (!numbersContainer) return;
        numbersContainer.innerHTML = '';
        document.getElementById('numbers-range-label').textContent = `Selecciona los números (0 a ${maxNumbers - 1}):`;
        for (let i = 0; i < maxNumbers; i++) {
            const numberBox = document.createElement('div');
            numberBox.classList.add('number-box');
            numberBox.textContent = String(i).padStart(2, '0');
            numberBox.dataset.number = i;
            numberBox.addEventListener('click', handleNumberClick);
            numbersContainer.appendChild(numberBox);
        }
    }

    function renderParticipants() {
        if (!resultsList) return;
        resultsList.innerHTML = '';
        participants.forEach((participant, index) => {
            const personEntry = document.createElement('div');
            personEntry.classList.add('person-entry');
            const numbersText = participant.numbers.sort((a, b) => a - b).map(n => String(n).padStart(2, '0')).join(', ');
            personEntry.innerHTML = `
                <div class="person-info">
                    <span class="person-name">${participant.name}</span>
                    <span class="person-numbers">Números: ${numbersText}</span>
                </div>
                <div class="person-actions">
                    <button class="edit-btn" data-index="${index}">✏️</button>
                    <button class="delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;
            resultsList.appendChild(personEntry);
        });
    }

    function updateAssignedNumbers() {
        const allAssigned = new Set(participants.flatMap(p => p.numbers));
        document.querySelectorAll('.number-box').forEach(box => {
            const num = parseInt(box.dataset.number, 10);
            box.classList.toggle('assigned', allAssigned.has(num));
            if (allAssigned.has(num)) {
                box.classList.remove('selected');
            }
        });
    }

    function saveData() {
        localStorage.setItem('raffleParticipants', JSON.stringify(participants));
        localStorage.setItem('raffleMaxNumbers', maxNumbers.toString());
    }

    // --- Event Handlers ---
    function handleNumberClick(event) {
        const numberBox = event.target;
        if (numberBox.classList.contains('assigned')) return;
        numberBox.classList.toggle('selected');
        const num = parseInt(numberBox.dataset.number, 10);
        const index = selectedNumbers.indexOf(num);
        if (index > -1) {
            selectedNumbers.splice(index, 1);
        } else {
            selectedNumbers.push(num);
        }
    }

    function addParticipant() {
        const name = personNameInput.value.trim();
        if (!name) {
            alert('Por favor, introduce un nombre.');
            return;
        }
        if (selectedNumbers.length === 0) {
            alert('Por favor, selecciona al menos un número.');
            return;
        }
        participants.push({ name: name, numbers: [...selectedNumbers] });
        personNameInput.value = '';
        document.querySelectorAll('.number-box.selected').forEach(box => box.classList.remove('selected'));
        selectedNumbers = [];
        saveData();
        renderParticipants();
        updateAssignedNumbers();
    }

    function deleteParticipant(index) {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${participants[index].name}?`)) {
            participants.splice(index, 1);
            saveData();
            renderParticipants();
            updateAssignedNumbers();
        }
    }

    function editParticipant(index) {
        const newName = prompt('Introduce el nuevo nombre:', participants[index].name);
        if (newName && newName.trim() !== '') {
            participants[index].name = newName.trim();
            saveData();
            renderParticipants();
        }
    }

    function clearAll() {
        if (confirm('¿ESTÁS SEGURO? Se borrarán todos los datos. Esta acción no se puede deshacer.')) {
            participants = [];
            selectedNumbers = [];
            maxNumbers = 100;
            saveData();
            initializeApp();
        }
    }

    function startSingleDraw() {
        const allAssignedNumbers = participants.flatMap(p => p.numbers);
        if (allAssignedNumbers.length === 0) {
            alert('No hay números asignados para sortear.');
            return;
        }
        winnerDisplay.style.display = 'block';
        winnerTop3Display.style.display = 'none';
        winnerSingleDisplay.style.display = 'block';
        let count = 3;
        countdownTimer.textContent = count;
        countdownTimer.style.display = 'block';
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownTimer.textContent = count;
            } else {
                clearInterval(countdownInterval);
                const rouletteInterval = setInterval(() => {
                    const randomNum = allAssignedNumbers[Math.floor(Math.random() * allAssignedNumbers.length)];
                    const randomParticipant = participants.find(p => p.numbers.includes(randomNum));
                    winnerNumberEl.textContent = String(randomNum).padStart(2, '0');
                    winnerNameEl.textContent = randomParticipant ? randomParticipant.name : '...';
                }, 50);
                setTimeout(() => {
                    clearInterval(rouletteInterval);
                    const winningNumber = allAssignedNumbers[Math.floor(Math.random() * allAssignedNumbers.length)];
                    const winner = participants.find(p => p.numbers.includes(winningNumber));
                    winnerNumberEl.textContent = String(winningNumber).padStart(2, '0');
                    winnerNameEl.textContent = winner ? winner.name : 'No encontrado';
                }, 3000);
            }
        }, 1000);
    }

    function startTop3Draw() {
        const allAssignedNumbers = participants.flatMap(p => p.numbers);
        if (allAssignedNumbers.length < 3) {
            alert('Se necesitan al menos 3 números asignados para un sorteo Top 3.');
            return;
        }
        winnerDisplay.style.display = 'block';
        winnerTop3Display.style.display = 'block';
        winnerSingleDisplay.style.display = 'none';
        winnerListTop3El.innerHTML = '';
        let count = 3;
        countdownTimer.textContent = count;
        countdownTimer.style.display = 'block';
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownTimer.textContent = count;
            } else {
                clearInterval(countdownInterval);
                const rouletteInterval = setInterval(() => {
                    const randomNum = allAssignedNumbers[Math.floor(Math.random() * allAssignedNumbers.length)];
                    countdownTimer.textContent = String(randomNum).padStart(2, '0');
                }, 50);
                setTimeout(() => {
                    clearInterval(rouletteInterval);
                    countdownTimer.style.display = 'none';
                    const shuffled = allAssignedNumbers.sort(() => 0.5 - Math.random());
                    const winningNumbers = shuffled.slice(0, 3);
                    winningNumbers.forEach(num => {
                        const winner = participants.find(p => p.numbers.includes(num));
                        const li = document.createElement('li');
                        li.innerHTML = `<span class="winner-name">${winner ? winner.name : 'N/A'}</span> - Número: <span class="winner-number">${String(num).padStart(2, '0')}</span>`;
                        winnerListTop3El.appendChild(li);
                    });
                }, 3000);
            }
        }, 1000);
    }

    function modifyGridSize(amount) {
        const newSize = maxNumbers + amount;
        if (newSize < 10) {
            alert('El número mínimo de casillas es 10.');
            return;
        }
        if (newSize < maxNumbers) {
            const allAssigned = new Set(participants.flatMap(p => p.numbers));
            for (let i = newSize; i < maxNumbers; i++) {
                if (allAssigned.has(i)) {
                    alert(`No se puede reducir el tamaño. El número ${i} ya está asignado.`);
                    return;
                }
            }
        }
        maxNumbers = newSize;
        saveData();
        generateNumberGrid();
        updateAssignedNumbers();
    }

    function exportToJson() {
        if (participants.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        const dataToExport = { participants: participants, maxNumbers: maxNumbers };
        const dataStr = JSON.stringify(dataToExport, null, 4);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `sorteo-red-pilar-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }

    function importFromJson(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.participants && data.maxNumbers) {
                    if (confirm('Esto reemplazará todos los datos actuales. ¿Continuar?')) {
                        participants = data.participants;
                        maxNumbers = data.maxNumbers;
                        saveData();
                        initializeApp();
                    }
                } else {
                    alert('El archivo JSON no tiene el formato esperado.');
                }
            } catch (error) {
                alert('Error al leer o procesar el archivo JSON.');
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }

    // --- Theme Switcher Logic ---
    function applyTheme(themeName) {
        // Reset all theme classes
        body.className = '';
        const canvas = document.getElementById('matrix-canvas');

        // Stop any running animations
        if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
        }
        if (canvas) {
            canvas.style.display = 'none';
        }

        switch (themeName) {
            case 'hacker':
                body.classList.add('hacker-theme');
                if (canvas) {
                    canvas.style.display = 'block';
                    startMatrix();
                }
                break;
            case 'jules':
                body.classList.add('jules-theme');
                break;
            case '4d':
                body.classList.add('4d-theme');
                break;
            case 'default':
            default:
                // No class needed for default theme
                break;
        }
    }

    function startMatrix() {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px arial';
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        matrixInterval = setInterval(draw, 33);
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('raffleTheme') || 'default';
        themeSelector.value = savedTheme;
        applyTheme(savedTheme);
    }

    // --- Visitor Counter ---
    function initializeVisitorCounter() {
        const visitorCounter = document.getElementById('visitor-counter');
        if (!visitorCounter) return;
        let count = localStorage.getItem('visitorCount') ? parseInt(localStorage.getItem('visitorCount')) + 1 : 1;
        localStorage.setItem('visitorCount', count);
        visitorCounter.textContent = count;
    }

    // --- Event Listeners Setup ---
    addButton.addEventListener('click', addParticipant);
    clearButton.addEventListener('click', clearAll);
    sorteoButton.addEventListener('click', startSingleDraw);
    sorteo3Button.addEventListener('click', startTop3Draw);
    add10Button.addEventListener('click', () => modifyGridSize(10));
    remove10Button.addEventListener('click', () => modifyGridSize(-10));
    exportButton.addEventListener('click', exportToJson);
    importButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importFromJson);
    themeSelector.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        localStorage.setItem('raffleTheme', e.target.value);
    });
    window.addEventListener('resize', () => {
        if (body.classList.contains('hacker-theme')) startMatrix();
    });
    resultsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) deleteParticipant(parseInt(event.target.dataset.index, 10));
        if (event.target.classList.contains('edit-btn')) editParticipant(parseInt(event.target.dataset.index, 10));
    });

    // --- Initial Load ---
    initializeApp();
});
