document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const numbersContainer = document.getElementById('numbers-container');
    const personNameInput = document.getElementById('person-name');
    const addButton = document.getElementById('add-button');
    const clearButton = document.getElementById('clear-button');
    const resultsList = document.getElementById('results-list');
    const sorteoButton = document.getElementById('sorteo-button');
    const winnerDisplay = document.getElementById('winner-display');
    const winnerSingleDisplay = document.getElementById('winner-single');
    const winnerTop3Display = document.getElementById('winner-top3');
    const countdownTimer = document.getElementById('countdown-timer');
    const winnerNumberEl = document.getElementById('winner-number');
    const winnerNameEl = document.getElementById('winner-name');
    const sorteo3Button = document.getElementById('sorteo-3-button');
    const winnerListTop3El = document.getElementById('winner-list-top3');

    // --- App State ---
    let participants = [];
    let selectedNumbers = [];
    const MAX_NUMBERS = 100; // Default to 100 numbers (0-99)

    // --- Functions ---

    /**
     * Loads data from localStorage and initializes the application.
     */
    function initializeApp() {
        const savedParticipants = localStorage.getItem('raffleParticipants');
        if (savedParticipants) {
            participants = JSON.parse(savedParticipants);
        }
        generateNumberGrid();
        renderParticipants();
        updateAssignedNumbers();
    }

    /**
     * Generates the grid of numbers.
     */
    function generateNumberGrid() {
        numbersContainer.innerHTML = '';
        for (let i = 0; i < MAX_NUMBERS; i++) {
            const numberBox = document.createElement('div');
            numberBox.classList.add('number-box');
            numberBox.textContent = String(i).padStart(2, '0');
            numberBox.dataset.number = i;
            numberBox.addEventListener('click', handleNumberClick);
            numbersContainer.appendChild(numberBox);
        }
    }

    /**
     * Renders the list of participants.
     */
    function renderParticipants() {
        resultsList.innerHTML = '';
        participants.forEach((participant, index) => {
            const personEntry = document.createElement('div');
            personEntry.classList.add('person-entry');
            personEntry.dataset.id = participant.id;

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

    /**
     * Updates the visual state of numbers that are already assigned.
     */
    function updateAssignedNumbers() {
        const allAssigned = new Set(participants.flatMap(p => p.numbers));
        document.querySelectorAll('.number-box').forEach(box => {
            const num = parseInt(box.dataset.number, 10);
            if (allAssigned.has(num)) {
                box.classList.add('assigned');
                box.classList.remove('selected');
            } else {
                box.classList.remove('assigned');
            }
        });
    }

    /**
     * Saves the current participant list to localStorage.
     */
    function saveData() {
        localStorage.setItem('raffleParticipants', JSON.stringify(participants));
    }

    /**
     * Handles clicking on a number box.
     * @param {Event} event The click event.
     */
    function handleNumberClick(event) {
        const numberBox = event.target;
        if (numberBox.classList.contains('assigned')) {
            return; // Cannot select assigned numbers
        }
        numberBox.classList.toggle('selected');
        const num = parseInt(numberBox.dataset.number, 10);
        const index = selectedNumbers.indexOf(num);

        if (index > -1) {
            selectedNumbers.splice(index, 1);
        } else {
            selectedNumbers.push(num);
        }
    }

    /**
     * Handles adding a new participant.
     */
    function addParticipant() {
        const name = personNameInput.value.trim();
        if (!name) {
            alert('Por favor, introduce un nombre para el participante.');
            return;
        }
        if (selectedNumbers.length === 0) {
            alert('Por favor, selecciona al menos un número.');
            return;
        }

        participants.push({
            id: Date.now(), // Simple unique ID
            name: name,
            numbers: [...selectedNumbers]
        });

        personNameInput.value = '';
        selectedNumbers = [];

        saveData();
        renderParticipants();
        updateAssignedNumbers();
        document.querySelectorAll('.number-box.selected').forEach(box => box.classList.remove('selected'));
    }
    
    /**
     * Handles deleting a participant.
     * @param {number} index The index of the participant to delete.
     */
    function deleteParticipant(index) {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${participants[index].name}?`)) {
            participants.splice(index, 1);
            saveData();
            renderParticipants();
            updateAssignedNumbers();
        }
    }

    /**
     * Handles editing a participant's name.
     * @param {number} index The index of the participant to edit.
     */
    function editParticipant(index) {
        const newName = prompt('Introduce el nuevo nombre:', participants[index].name);
        if (newName && newName.trim() !== '') {
            participants[index].name = newName.trim();
            saveData();
            renderParticipants();
        }
    }

    /**
     * Handles clearing all data.
     */
    function clearAll() {
        if (confirm('¿ESTÁS SEGURO? Se borrarán todos los participantes y números. Esta acción no se puede deshacer.')) {
            participants = [];
            selectedNumbers = [];
            localStorage.removeItem('raffleParticipants');
            initializeApp();
        }
    }


    /**
     * Starts the draw for a single winner.
     */
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
                countdownTimer.style.display = 'none';

                // Select winner
                const winningNumber = allAssignedNumbers[Math.floor(Math.random() * allAssignedNumbers.length)];
                const winner = participants.find(p => p.numbers.includes(winningNumber));

                winnerNumberEl.textContent = String(winningNumber).padStart(2, '0');
                winnerNameEl.textContent = winner ? winner.name : 'No encontrado';
            }
        }, 1000);
    }


    /**
     * Starts the draw for Top 3 winners.
     */
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
                countdownTimer.style.display = 'none';

                // Shuffle the array to get random winners
                const shuffled = allAssignedNumbers.sort(() => 0.5 - Math.random());
                const winningNumbers = shuffled.slice(0, 3);

                winningNumbers.forEach(num => {
                    const winner = participants.find(p => p.numbers.includes(num));
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="winner-name">${winner ? winner.name : 'N/A'}</span> -
                        Número: <span class="winner-number">${String(num).padStart(2, '0')}</span>
                    `;
                    winnerListTop3El.appendChild(li);
                });
            }
        }, 1000);
    }


    // --- Event Listeners ---
    addButton.addEventListener('click', addParticipant);
    clearButton.addEventListener('click', clearAll);
    sorteoButton.addEventListener('click', startSingleDraw);
    sorteo3Button.addEventListener('click', startTop3Draw);

    // Use event delegation for edit/delete buttons
    resultsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const index = parseInt(event.target.dataset.index, 10);
            deleteParticipant(index);
        }
        if (event.target.classList.contains('edit-btn')) {
            const index = parseInt(event.target.dataset.index, 10);
            editParticipant(index);
        }
    });


    // --- Theme Switcher Logic ---
    const themeSelector = document.getElementById('theme-selector');
    const body = document.body;

    let matrixInterval;

    function applyTheme(themeName) {
        // Reset all theme classes
        body.className = '';
        const canvas = document.getElementById('matrix-canvas');

        if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
        }
        if (canvas) {
            canvas.style.display = 'none';
        }

        if (themeName !== 'default') {
            body.classList.add(`${themeName}-theme`);
        }

        if (themeName === 'hacker') {
            if (canvas) {
                canvas.style.display = 'block';
                startMatrix();
            }
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

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px arial';
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        if(matrixInterval) clearInterval(matrixInterval);
        matrixInterval = setInterval(draw, 33);
    }

    themeSelector.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        localStorage.setItem('raffleTheme', e.target.value);
    });

    window.addEventListener('resize', () => {
        const canvas = document.getElementById('matrix-canvas');
        if (canvas && canvas.style.display === 'block') {
            startMatrix();
        }
    });

    function loadTheme() {
        const savedTheme = localStorage.getItem('raffleTheme');
        if (savedTheme) {
            themeSelector.value = savedTheme;
            applyTheme(savedTheme);
        }
    }


    function initializeVisitorCounter() {
        const visitorCounter = document.getElementById('visitor-counter');
        if (!visitorCounter) return;

        let count = localStorage.getItem('visitorCount');
        count = count ? parseInt(count, 10) + 1 : 1;

        localStorage.setItem('visitorCount', count);
        visitorCounter.textContent = count;
    }


    // --- Initial Load ---
    initializeApp();
    loadTheme();
    initializeVisitorCounter();
});
