const numbersContainer = document.getElementById('numbers-container');
const personNameInput = document.getElementById('person-name');
const addButton = document.getElementById('add-button');
const clearButton = document.getElementById('clear-button');
const sorteoButton = document.getElementById('sorteo-button');
const add10Button = document.getElementById('add-10-button');
const remove10Button = document.getElementById('remove-10-button');
const selectRange10Button = document.getElementById('select-range-10-button');
const searchButton = document.getElementById('search-button');
const searchNumberInput = document.getElementById('search-number-input');
const resultsList = document.getElementById('results-list');
const ganadorContainer = document.getElementById('ganador-container');
const ganadorNumero = document.getElementById('ganador-numero');
const ganadorNombre = document.getElementById('ganador-nombre');
const countdownTimer = document.getElementById('countdown-timer');
const themeSelector = document.getElementById('theme-selector');
const body = document.body;
const mainContainer = document.getElementById('main-container');
const numbersRangeLabel = document.getElementById('numbers-range-label');

// Audio
const countdownSound = new Audio('https://www.soundboard.com/mediafiles/3/30018_e2f694931a78c1874249a567634f195d.mp3');
const spinSound = new Audio('https://www.soundboard.com/mediafiles/1/18167_nfs_prostreet_rev_4.mp3');
const winnerSound = new Audio('https://www.soundboard.com/mediafiles/6/6389_87900b90e9e46a78280f58a329d91f86.mp3');

let selectedNumbers = [];
let allParticipants = [];
let assignedNumbers = new Set();
const MIN_NUMBERS = 100;
let currentMaxNumber = 99;

loadData();

function updateRangeLabel() {
    numbersRangeLabel.textContent = `Selecciona los números (00 a ${currentMaxNumber}):`;
}

function createNumberBox(number) {
    const numberBox = document.createElement('div');
    numberBox.classList.add('number-box');
    numberBox.textContent = String(number).padStart(2, '0');
    numberBox.dataset.number = number;
    numbersContainer.appendChild(numberBox);

    numberBox.addEventListener('click', () => {
        if (!numberBox.classList.contains('assigned')) {
            numberBox.classList.toggle('selected');
            const num = parseInt(numberBox.dataset.number);
            const index = selectedNumbers.indexOf(num);
            if (index > -1) {
                selectedNumbers.splice(index, 1);
            } else {
                selectedNumbers.push(num);
            }
        }
    });
}

function generateNumberBoxes(start, end) {
    for (let i = start; i <= end; i++) {
        createNumberBox(i);
    }
}

function saveData() {
    const data = {
        participants: allParticipants,
        assignedNumbers: [...assignedNumbers],
        currentMaxNumber: currentMaxNumber
    };
    localStorage.setItem('raffleData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('raffleData');
    if (savedData) {
        const data = JSON.parse(savedData);
        allParticipants = data.participants;
        assignedNumbers = new Set(data.assignedNumbers);
        currentMaxNumber = data.currentMaxNumber;

        generateNumberBoxes(0, currentMaxNumber);
        updateParticipantsList();
    } else {
        generateNumberBoxes(0, 99);
        currentMaxNumber = 99;
    }

    updateRangeLabel();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        themeSelector.value = savedTheme;
        applyTheme(savedTheme);
    } else {
        themeSelector.value = 'default';
    }
}

function updateParticipantsList() {
    resultsList.innerHTML = '';
    allParticipants.forEach((participant, index) => {
        const personEntry = document.createElement('div');
        personEntry.classList.add('person-entry');
        personEntry.dataset.index = index;

        const numbersText = participant.numbers.sort((a, b) => a - b).map(n => String(n).padStart(2, '0')).join(', ');
        personEntry.innerHTML = `
            <div class="person-info">
                <div class="person-name">${participant.name}</div>
                <div class="person-numbers">Números: ${numbersText}</div>
            </div>
            <div class="person-actions">
                <button class="action-button" onclick="editParticipant(${index})">✎</button>
                <button class="action-button" onclick="removeParticipant(${index})">🗑️</button>
            </div>
        `;
        resultsList.appendChild(personEntry);
    });
    
    assignedNumbers.forEach(num => {
        const box = document.querySelector(`.number-box[data-number="${num}"]`);
        if (box) {
            box.classList.add('assigned');
            box.classList.remove('selected');
        }
    });
}

function editParticipant(index) {
    const participant = allParticipants[index];
    const entry = document.querySelector(`.person-entry[data-index="${index}"]`);
    
    entry.classList.add('edit-mode');
    entry.innerHTML = `
        <div class="person-info">
            <input type="text" id="edit-name-${index}" value="${participant.name}">
            <div class="person-numbers-list">
                ${participant.numbers.sort((a,b)=>a-b).map(num => `
                    <span class="person-number-chip">
                        ${String(num).padStart(2, '0')}
                        <button onclick="removeNumberFromParticipant(${index}, ${num})">🗑️</button>
                    </span>
                `).join('')}
                <button id="add-number-btn" onclick="addNumberToParticipant(${index})">Agregar número</button>
            </div>
        </div>
        <div class="person-actions">
            <button id="update-name-btn" onclick="updateParticipantName(${index})">Actualizar participante</button>
        </div>
    `;
}

function updateParticipantName(index) {
    const newName = document.getElementById(`edit-name-${index}`).value.trim();
    if (newName === '') {
        alert('El nombre no puede estar vacío.');
        return;
    }

    const participant = allParticipants[index];
    participant.name = newName;
    
    saveData();
    updateParticipantsList();
}


function removeNumberFromParticipant(index, numberToRemove) {
    const participant = allParticipants[index];
    const numberIndex = participant.numbers.indexOf(numberToRemove);
    
    if (numberIndex > -1) {
        participant.numbers.splice(numberIndex, 1);
        assignedNumbers.delete(numberToRemove);
        
        const box = document.querySelector(`.number-box[data-number="${numberToRemove}"]`);
        if (box) {
            box.classList.remove('assigned');
            box.classList.remove('selected');
        }
        saveData();
        editParticipant(index); // Re-renderizar la entrada de edición
    }
}

function addNumberToParticipant(index) {
    const number = prompt(`Ingresa un número para agregar (00-${currentMaxNumber}):`);
    if (number === null || number.trim() === '') return;

    const num = parseInt(number);
    if (isNaN(num) || num < 0 || num > currentMaxNumber) {
        alert(`Número inválido. Debe estar entre 00 y ${currentMaxNumber}.`);
        return;
    }

    if (assignedNumbers.has(num)) {
        alert('Ese número ya está asignado a otro participante.');
        return;
    }

    const participant = allParticipants[index];
    if (participant.numbers.includes(num)) {
        alert('Ese número ya está asignado a este participante.');
        return;
    }
    
    participant.numbers.push(num);
    assignedNumbers.add(num);
    
    const box = document.querySelector(`.number-box[data-number="${num}"]`);
    if (box) {
        box.classList.add('assigned');
    }

    saveData();
    editParticipant(index); // Re-renderizar la entrada de edición
}

function removeParticipant(index) {
    if (confirm('¿Estás seguro de que quieres eliminar a este participante?')) {
        const participant = allParticipants[index];
        participant.numbers.forEach(num => {
            assignedNumbers.delete(num);
            const box = document.querySelector(`.number-box[data-number="${num}"]`);
            if (box) {
                box.classList.remove('assigned');
            }
        });
        allParticipants.splice(index, 1);
        saveData();
        updateParticipantsList();
    }
}

addButton.addEventListener('click', () => {
    const personName = personNameInput.value.trim();
    if (personName === '') {
        alert('Por favor, escribe el nombre de la persona.');
        return;
    }
    if (selectedNumbers.length === 0) {
        alert('Por favor, selecciona al menos un número.');
        return;
    }

    allParticipants.push({ name: personName, numbers: selectedNumbers });

    selectedNumbers.forEach(num => {
        assignedNumbers.add(num);
    });

    personNameInput.value = '';
    selectedNumbers = [];
    
    // Deseleccionar y actualizar
    document.querySelectorAll('.number-box.selected').forEach(box => {
        box.classList.remove('selected');
    });
    
    saveData();
    updateParticipantsList();
});

sorteoButton.addEventListener('click', () => {
    const allAssignedNumbersArray = allParticipants.flatMap(p => p.numbers);
    if (allAssignedNumbersArray.length === 0) {
        alert('No hay números asignados para realizar el sorteo.');
        return;
    }
    
    // Desplazar la vista al contenedor del sorteo
    ganadorContainer.style.display = 'block';
    ganadorContainer.scrollIntoView({ behavior: 'smooth' });

    ganadorNumero.textContent = '';
    ganadorNombre.textContent = '';
    ganadorNumero.classList.remove('sorteo-running');
    ganadorNombre.classList.remove('sorteo-running');
    ganadorNombre.classList.remove('ganador-zoom');
    countdownTimer.style.display = 'block';

    let count = 5;
    countdownTimer.textContent = count;
    countdownSound.play();

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownTimer.textContent = count;
            countdownSound.play();
        } else {
            clearInterval(countdownInterval);
            countdownTimer.style.display = 'none';
            
            spinSound.loop = true;
            spinSound.play();

            ganadorNumero.classList.add('sorteo-running');
            ganadorNombre.classList.add('sorteo-running');

            const spinInterval = setInterval(() => {
                const randomNum = allAssignedNumbersArray[Math.floor(Math.random() * allAssignedNumbersArray.length)];
                ganadorNumero.textContent = String(randomNum).padStart(2, '0');
                const randomWinner = allParticipants[Math.floor(Math.random() * allParticipants.length)];
                ganadorNombre.textContent = randomWinner.name;
            }, 25);

            setTimeout(() => {
                clearInterval(spinInterval);
                spinSound.pause();
                spinSound.currentTime = 0;
                winnerSound.play();

                ganadorNumero.classList.remove('sorteo-running');
                ganadorNombre.classList.remove('sorteo-running');
                
                const winningNumber = allAssignedNumbersArray[Math.floor(Math.random() * allAssignedNumbersArray.length)];
                const winner = allParticipants.find(p => p.numbers.includes(winningNumber));

                ganadorNumero.textContent = String(winningNumber).padStart(2, '0');
                ganadorNombre.textContent = winner ? winner.name : 'No encontrado';
                ganadorNombre.classList.add('ganador-zoom');

                startConfetti();

            }, 3000);
        }
    }, 1000);
});

clearButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar toda la lista de participantes y números?')) {
        localStorage.clear();
        resultsList.innerHTML = '';
        ganadorContainer.style.display = 'none';
        personNameInput.value = '';
        selectedNumbers = [];
        allParticipants.length = 0;
        assignedNumbers.clear();

        document.querySelectorAll('.number-box').forEach(box => {
            box.remove();
        });
        generateNumberBoxes(0, 99);
        currentMaxNumber = 99;
        updateRangeLabel();
        saveData();
    }
});

function addNumbers(count) {
    const lastNumber = numbersContainer.childElementCount > 0 ? parseInt(numbersContainer.lastChild.dataset.number) : -1;
    generateNumberBoxes(lastNumber + 1, lastNumber + count);
    currentMaxNumber = lastNumber + count;
    updateRangeLabel();
    saveData();
}

function removeNumbers(count) {
    let removedCount = 0;
    const boxes = numbersContainer.children;
    const currentMaxNumberCopy = currentMaxNumber;

    if (currentMaxNumberCopy < 99) {
        alert(`No se pueden eliminar más números. El mínimo es el 99.`);
        return;
    }

    for (let i = currentMaxNumberCopy; i >= 0 && removedCount < count; i--) {
        if (!assignedNumbers.has(i)) {
            const box = document.querySelector(`.number-box[data-number="${i}"]`);
            if (box) {
                box.remove();
                removedCount++;
            }
        }
    }
    
    if (removedCount > 0) {
        currentMaxNumber = currentMaxNumberCopy - removedCount;
        updateRangeLabel();
        saveData();
    }
}

add10Button.addEventListener('click', () => addNumbers(10));
remove10Button.addEventListener('click', () => removeNumbers(10));

selectRange10Button.addEventListener('click', () => {
    const allBoxes = document.querySelectorAll('.number-box');
    const unassignedBoxes = Array.from(allBoxes).filter(box => !box.classList.contains('assigned'));

    let newSelected = 0;
    unassignedBoxes.forEach((box, index) => {
        if (newSelected < 10 && !box.classList.contains('selected')) {
            box.classList.add('selected');
            const num = parseInt(box.dataset.number);
            if (!selectedNumbers.includes(num)) {
                selectedNumbers.push(num);
                newSelected++;
            }
        }
    });
});

function searchNumber() {
    const numToSearch = parseInt(searchNumberInput.value.trim());

    if (isNaN(numToSearch)) {
        alert('Por favor, ingresa un número válido.');
        return;
    }

    const foundParticipant = allParticipants.find(p => p.numbers.includes(numToSearch));
    const formattedNum = String(numToSearch).padStart(2, '0');

    if (foundParticipant) {
        alert(`El número ${formattedNum} está asignado a: ${foundParticipant.name}`);
    } else {
        alert(`El número ${formattedNum} no está asignado a nadie.`);
    }
}

searchButton.addEventListener('click', searchNumber);
searchNumberInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchNumber();
    }
});

function startConfetti() {
    const confettiContainer = document.querySelector('.container');
    const colors = ['#f06', '#ff0', '#0f0', '#0ff', '#00f', '#f0f'];
    const count = 200;
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confettiContainer.appendChild(confetti);
        confetti.addEventListener('animationend', () => confetti.remove());
    }
}

themeSelector.addEventListener('change', (event) => {
    applyTheme(event.target.value);
    localStorage.setItem('theme', event.target.value);
});

function applyTheme(themeName) {
    body.className = '';
    mainContainer.className = 'container';
    switch (themeName) {
        case 'cosmic':
            body.classList.add('cosmic-theme');
            mainContainer.classList.add('cosmic-theme');
            break;
        case 'neon':
            body.classList.add('neon-theme');
            mainContainer.classList.add('neon-theme');
            break;
        case 'pastel':
            body.classList.add('pastel-theme');
            mainContainer.classList.add('pastel-theme');
            break;
        default:
            break;
    }
}
