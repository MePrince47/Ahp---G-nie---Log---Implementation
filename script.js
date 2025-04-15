/**
 * Sélecteur de Téléphone AHP
 * Application utilisant la méthode AHP (Analytic Hierarchy Process) pour aider à choisir
 * le meilleur téléphone selon les préférences de l'utilisateur.
 */

// Données des téléphones (alternatives)
const phones = [
    { name: "Iphone 12", memory: 4, storage: 128, cpuFreq: 2.99, price: 800, brand: 9 },
    { name: "Itel A56", memory: 2, storage: 32, cpuFreq: 1.3, price: 100, brand: 3 },
    { name: "Tecno Camon 12", memory: 4, storage: 64, cpuFreq: 2.0, price: 150, brand: 4 },
    { name: "Infinix Hot 10", memory: 3, storage: 64, cpuFreq: 2.0, price: 130, brand: 4 },
    { name: "Huawei P30", memory: 6, storage: 128, cpuFreq: 2.6, price: 500, brand: 7 },
    { name: "Google Pixel 7", memory: 8, storage: 128, cpuFreq: 2.85, price: 600, brand: 8 },
    { name: "Xiaomi Redmi Note 10", memory: 4, storage: 64, cpuFreq: 2.2, price: 200, brand: 6 },
    { name: "Samsung Galaxy S22", memory: 8, storage: 256, cpuFreq: 3.0, price: 850, brand: 9 },
    { name: "Motorola Razr+", memory: 8, storage: 256, cpuFreq: 3.2, price: 1000, brand: 7 },
    { name: "Iphone XR", memory: 3, storage: 64, cpuFreq: 2.5, price: 450, brand: 8 },
    { name: "Samsung Galaxy Note 10", memory: 8, storage: 256, cpuFreq: 2.7, price: 700, brand: 8 }
];

// Critères
const criteria = ["Mémoire", "Stockage", "Fréquence CPU", "Prix", "Marque"];

// Normalisation des données des téléphones pour chaque critère
const normalizedPhones = normalizePhoneData(phones);

// Initialisation des variables globales
let criteriaWeights = [];
let consistencyRatio = 0;
let phoneScores = [];

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le thème
    initTheme();
    
    // Ajouter les écouteurs d'événements
    document.getElementById('calculate-btn').addEventListener('click', calculateResults);
    document.getElementById('reset-btn').addEventListener('click', resetMatrix);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Initialiser la matrice
    initMatrix();
});

/**
 * Initialise le thème de l'application
 */
function initTheme() {
    // Vérifier si un thème est enregistré dans le localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

/**
 * Bascule entre le mode clair et le mode sombre
 */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

/**
 * Initialise la matrice de comparaison des critères
 */
function initMatrix() {
    const table = document.getElementById('criteria-table');
    
    // Ajouter des écouteurs d'événements pour mettre à jour les valeurs réciproques
    const inputs = table.querySelectorAll('input:not([disabled])');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            updateReciprocalValue(this);
        });
    });
}

/**
 * Met à jour la valeur réciproque dans la matrice
 * @param {HTMLInputElement} input - L'élément input modifié
 */
function updateReciprocalValue(input) {
    const row = input.closest('tr');
    const rowIndex = row.rowIndex - 1; // -1 pour tenir compte de l'en-tête
    const cellIndex = input.closest('td').cellIndex - 1; // -1 pour tenir compte de l'en-tête
    
    // Valider la valeur (entre 1 et 9)
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        value = 1;
        input.value = 1;
    } else if (value > 9) {
        value = 9;
        input.value = 9;
    }
    
    // Calculer la valeur réciproque (1/value)
    const reciprocalValue = 1 / value;
    
    // Mettre à jour la cellule réciproque
    const table = document.getElementById('criteria-table');
    const reciprocalCell = table.rows[cellIndex + 1].cells[rowIndex + 1];
    const reciprocalInput = reciprocalCell.querySelector('input');
    
    // Désactiver temporairement l'écouteur d'événements pour éviter une boucle infinie
    reciprocalInput.removeEventListener('change', function() {
        updateReciprocalValue(this);
    });
    
    // Mettre à jour la valeur réciproque
    reciprocalInput.value = value;
    reciprocalInput.disabled = true;
    
    // Réactiver l'écouteur d'événements
    reciprocalInput.addEventListener('change', function() {
        updateReciprocalValue(this);
    });
}

/**
 * Réinitialise la matrice de comparaison des critères
 */
function resetMatrix() {
    const table = document.getElementById('criteria-table');
    const inputs = table.querySelectorAll('input:not([disabled])');
    
    inputs.forEach(input => {
        input.value = 1;
    });
    
    // Cacher la section des résultats si elle est visible
    document.getElementById('results-section').classList.add('hidden');
}

/**
 * Calcule les résultats en utilisant la méthode AHP
 */
function calculateResults() {
    // Récupérer la matrice de comparaison des critères
    const matrix = getCriteriaMatrix();
    
    // Calculer les poids des critères
    criteriaWeights = calculateCriteriaWeights(matrix);
    
    // Calculer le ratio de cohérence
    consistencyRatio = calculateConsistencyRatio(matrix, criteriaWeights);
    
    // Calculer les scores des téléphones
    phoneScores = calculatePhoneScores(normalizedPhones, criteriaWeights);
    
    // Afficher les résultats
    displayResults(phoneScores, criteriaWeights, consistencyRatio);
}

/**
 * Récupère la matrice de comparaison des critères depuis le formulaire
 * @returns {Array<Array<number>>} La matrice de comparaison des critères
 */
function getCriteriaMatrix() {
    const table = document.getElementById('criteria-table');
    const matrix = [];
    
    // Parcourir les lignes de la table (en ignorant l'en-tête)
    for (let i = 1; i < table.rows.length; i++) {
        const row = [];
        
        // Parcourir les cellules de la ligne (en ignorant l'en-tête)
        for (let j = 1; j < table.rows[i].cells.length; j++) {
            const input = table.rows[i].cells[j].querySelector('input');
            const value = parseFloat(input.value);
            
            // Si la cellule est dans la partie supérieure de la matrice, utiliser la valeur saisie
            // Sinon, utiliser la valeur réciproque (1/value)
            if (i <= j) {
                row.push(value);
            } else {
                row.push(1 / parseFloat(table.rows[j].cells[i].querySelector('input').value));
            }
        }
        
        matrix.push(row);
    }
    
    return matrix;
}

/**
 * Calcule les poids des critères à partir de la matrice de comparaison
 * @param {Array<Array<number>>} matrix - La matrice de comparaison des critères
 * @returns {Array<number>} Les poids des critères
 */
function calculateCriteriaWeights(matrix) {
    const n = matrix.length;
    const weights = [];
    
    // Étape 1: Calculer la somme de chaque colonne
    const columnSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            columnSums[j] += matrix[i][j];
        }
    }
    
    // Étape 2: Normaliser la matrice en divisant chaque élément par la somme de sa colonne
    const normalizedMatrix = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(matrix[i][j] / columnSums[j]);
        }
        normalizedMatrix.push(row);
    }
    
    // Étape 3: Calculer la moyenne de chaque ligne pour obtenir les poids
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += normalizedMatrix[i][j];
        }
        weights.push(sum / n);
    }
    
    return weights;
}

/**
 * Calcule le ratio de cohérence de la matrice de comparaison
 * @param {Array<Array<number>>} matrix - La matrice de comparaison des critères
 * @param {Array<number>} weights - Les poids des critères
 * @returns {number} Le ratio de cohérence
 */
function calculateConsistencyRatio(matrix, weights) {
    const n = matrix.length;
    
    // Indices de cohérence aléatoire (Random Consistency Index)
    const RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    
    // Étape 1: Calculer le vecteur de cohérence
    const consistencyVector = [];
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += matrix[i][j] * weights[j];
        }
        consistencyVector.push(sum / weights[i]);
    }
    
    // Étape 2: Calculer lambda max (moyenne du vecteur de cohérence)
    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
        lambdaMax += consistencyVector[i];
    }
    lambdaMax /= n;
    
    // Étape 3: Calculer l'indice de cohérence (CI)
    const CI = (lambdaMax - n) / (n - 1);
    
    // Étape 4: Calculer le ratio de cohérence (CR)
    const CR = CI / RI[n - 1];
    
    return CR;
}

/**
 * Normalise les données des téléphones pour chaque critère
 * @param {Array<Object>} phones - Les données des téléphones
 * @returns {Array<Object>} Les données normalisées des téléphones
 */
function normalizePhoneData(phones) {
    // Créer une copie profonde des téléphones
    const normalizedPhones = JSON.parse(JSON.stringify(phones));
    
    // Trouver les valeurs min et max pour chaque critère
    const minMax = {
        memory: { min: Infinity, max: -Infinity },
        storage: { min: Infinity, max: -Infinity },
        cpuFreq: { min: Infinity, max: -Infinity },
        price: { min: Infinity, max: -Infinity },
        brand: { min: Infinity, max: -Infinity }
    };
    
    phones.forEach(phone => {
        minMax.memory.min = Math.min(minMax.memory.min, phone.memory);
        minMax.memory.max = Math.max(minMax.memory.max, phone.memory);
        
        minMax.storage.min = Math.min(minMax.storage.min, phone.storage);
        minMax.storage.max = Math.max(minMax.storage.max, phone.storage);
        
        minMax.cpuFreq.min = Math.min(minMax.cpuFreq.min, phone.cpuFreq);
        minMax.cpuFreq.max = Math.max(minMax.cpuFreq.max, phone.cpuFreq);
        
        minMax.price.min = Math.min(minMax.price.min, phone.price);
        minMax.price.max = Math.max(minMax.price.max, phone.price);
        
        minMax.brand.min = Math.min(minMax.brand.min, phone.brand);
        minMax.brand.max = Math.max(minMax.brand.max, phone.brand);
    });
    
    // Normaliser les valeurs (0-1)
    normalizedPhones.forEach(phone => {
        // Pour la mémoire, le stockage, la fréquence CPU et la marque, plus c'est élevé, mieux c'est
        phone.memory = (phone.memory - minMax.memory.min) / (minMax.memory.max - minMax.memory.min);
        phone.storage = (phone.storage - minMax.storage.min) / (minMax.storage.max - minMax.storage.min);
        phone.cpuFreq = (phone.cpuFreq - minMax.cpuFreq.min) / (minMax.cpuFreq.max - minMax.cpuFreq.min);
        phone.brand = (phone.brand - minMax.brand.min) / (minMax.brand.max - minMax.brand.min);
        
        // Pour le prix, moins c'est élevé, mieux c'est (inverser la normalisation)
        phone.price = 1 - (phone.price - minMax.price.min) / (minMax.price.max - minMax.price.min);
    });
    
    return normalizedPhones;
}

/**
 * Calcule les scores des téléphones en utilisant les poids des critères
 * @param {Array<Object>} normalizedPhones - Les données normalisées des téléphones
 * @param {Array<number>} weights - Les poids des critères
 * @returns {Array<Object>} Les scores des téléphones
 */
function calculatePhoneScores(normalizedPhones, weights) {
    const scores = [];
    
    normalizedPhones.forEach((phone, index) => {
        // Calculer le score pondéré pour chaque téléphone
        const score = 
            weights[0] * phone.memory +
            weights[1] * phone.storage +
            weights[2] * phone.cpuFreq +
            weights[3] * phone.price +
            weights[4] * phone.brand;
        
        scores.push({
            name: phone.name,
            score: score,
            originalIndex: index
        });
    });
    
    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);
    
    // Ajouter le rang
    scores.forEach((phone, index) => {
        phone.rank = index + 1;
    });
    
    return scores;
}

/**
 * Affiche les résultats de l'analyse AHP
 * @param {Array<Object>} phoneScores - Les scores des téléphones
 * @param {Array<number>} criteriaWeights - Les poids des critères
 * @param {number} consistencyRatio - Le ratio de cohérence
 */
function displayResults(phoneScores, criteriaWeights, consistencyRatio) {
    // Afficher la section des résultats
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    // Afficher le téléphone recommandé
    const topPhone = document.getElementById('top-phone');
    topPhone.textContent = phoneScores[0].name;
    
    // Afficher les poids des critères
    displayCriteriaWeightsChart(criteriaWeights);
    
    // Afficher les scores des téléphones
    displayPhoneScoresChart(phoneScores);
    
    // Afficher les résultats détaillés
    displayDetailedResults(phoneScores, consistencyRatio);
    
    // Faire défiler jusqu'aux résultats
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Affiche le graphique des poids des critères
 * @param {Array<number>} weights - Les poids des critères
 */
function displayCriteriaWeightsChart(weights) {
    const chartContainer = document.getElementById('criteria-weights-chart');
    chartContainer.innerHTML = '';
    
    // Créer les barres pour chaque critère
    weights.forEach((weight, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${weight * 100}%`;
        
        // Ajouter l'étiquette du critère
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = criteria[index];
        bar.appendChild(label);
        
        // Ajouter la valeur du poids
        const value = document.createElement('div');
        value.className = 'bar-value';
        value.textContent = (weight * 100).toFixed(1) + '%';
        bar.appendChild(value);
        
        chartContainer.appendChild(bar);
    });
}

/**
 * Affiche le graphique des scores des téléphones
 * @param {Array<Object>} scores - Les scores des téléphones
 */
function displayPhoneScoresChart(scores) {
    const chartContainer = document.getElementById('phone-scores-chart');
    chartContainer.innerHTML = '';
    
    // Limiter à 10 téléphones maximum pour le graphique
    const displayScores = scores.slice(0, 10);
    
    // Créer les barres pour chaque téléphone
    displayScores.forEach(phone => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${phone.score * 100}%`;
        
        // Ajouter l'étiquette du téléphone
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = phone.name;
        bar.appendChild(label);
        
        // Ajouter la valeur du score
        const value = document.createElement('div');
        value.className = 'bar-value';
        value.textContent = (phone.score * 100).toFixed(1) + '%';
        bar.appendChild(value);
        
        chartContainer.appendChild(bar);
    });
}

/**
 * Affiche les résultats détaillés
 * @param {Array<Object>} scores - Les scores des téléphones
 * @param {number} consistencyRatio - Le ratio de cohérence
 */
function displayDetailedResults(scores, consistencyRatio) {
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';
    
    // Ajouter une ligne pour chaque téléphone
    scores.forEach(phone => {
        const row = document.createElement('tr');
        
        // Ajouter le nom du téléphone
        const nameCell = document.createElement('td');
        nameCell.textContent = phone.name;
        row.appendChild(nameCell);
        
        // Ajouter le score
        const scoreCell = document.createElement('td');
        scoreCell.textContent = (phone.score * 100).toFixed(1) + '%';
        row.appendChild(scoreCell);
        
        // Ajouter le rang
        const rankCell = document.createElement('td');
        rankCell.textContent = phone.rank;
        row.appendChild(rankCell);
        
        resultsBody.appendChild(row);
    });
    
    // Ajouter une information sur le ratio de cohérence
    const crInfo = document.createElement('p');
    crInfo.className = 'mt-1 mb-1';
    
    if (consistencyRatio < 0.1) {
        crInfo.textContent = `Ratio de cohérence: ${(consistencyRatio * 100).toFixed(1)}% (Bon: < 10%)`;
        crInfo.style.color = 'var(--secondary-color)';
    } else {
        crInfo.textContent = `Ratio de cohérence: ${(consistencyRatio * 100).toFixed(1)}% (Attention: > 10%)`;
        crInfo.style.color = 'orange';
    }
    
    // Ajouter l'information après le tableau
    const detailedResults = document.querySelector('.detailed-results');
    
    // Supprimer l'ancienne information si elle existe
    const oldCrInfo = detailedResults.querySelector('p');
    if (oldCrInfo) {
        detailedResults.removeChild(oldCrInfo);
    }
    
    detailedResults.appendChild(crInfo);
}
