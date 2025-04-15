# Documentation Technique : Sélecteur de Téléphone AHP

Ce document explique en détail le processus de création de l'application "Sélecteur de Téléphone AHP", une application web qui utilise la méthode AHP (Analytic Hierarchy Process) pour aider les utilisateurs à choisir le meilleur téléphone selon leurs préférences.

## Table des matières

1. [Introduction](#introduction)
2. [Structure du projet](#structure-du-projet)
3. [Conception de l'interface utilisateur](#conception-de-linterface-utilisateur)
4. [Implémentation de la méthode AHP](#implémentation-de-la-méthode-ahp)
5. [Fonctionnalités clés](#fonctionnalités-clés)
6. [Guide du code](#guide-du-code)
7. [Améliorations possibles](#améliorations-possibles)

## Introduction

### Qu'est-ce que la méthode AHP ?

La méthode AHP (Analytic Hierarchy Process) est une technique d'aide à la décision multicritère développée par Thomas L. Saaty dans les années 1970. Elle permet de décomposer un problème complexe en une hiérarchie de sous-problèmes plus simples, puis d'évaluer l'importance relative de chaque élément.

### Objectif de l'application

L'objectif de cette application est de permettre aux utilisateurs de déterminer le téléphone idéal à acheter en fonction de leurs préférences personnelles concernant différents critères comme la mémoire, le stockage, la fréquence CPU, le prix et la marque.

## Structure du projet

Le projet est organisé en quatre fichiers principaux :

1. **index.html** : Structure de l'application
2. **style.css** : Style et mise en forme visuelle
3. **script.js** : Logique de l'application et implémentation de la méthode AHP
4. **README.md** : Instructions pour l'utilisateur

Cette structure simple permet une séparation claire des préoccupations (structure, présentation, comportement) et facilite la maintenance du code.

## Conception de l'interface utilisateur

### Principes de conception

L'interface utilisateur a été conçue selon les principes suivants :

- **Simplicité** : Interface épurée et intuitive
- **Clarté** : Instructions claires et résultats faciles à comprendre
- **Réactivité** : Design responsive pour s'adapter à tous les appareils
- **Accessibilité** : Contraste suffisant et taille de texte lisible
- **Esthétique** : Couleurs harmonieuses et animations subtiles

### Structure de l'interface

L'interface est divisée en plusieurs sections :

1. **En-tête** : Titre de l'application et bouton de basculement du thème
2. **Introduction** : Explication de la méthode AHP et instructions
3. **Matrice de comparaison** : Formulaire pour saisir les comparaisons par paires
4. **Échelle d'importance** : Guide pour comprendre l'échelle de 1 à 9
5. **Résultats** : Affichage du téléphone recommandé, des poids des critères et des scores des téléphones

### Système de thème

L'application propose deux thèmes :

- **Mode clair** : Fond clair avec texte foncé
- **Mode sombre** : Fond foncé avec texte clair

Le thème est stocké dans le localStorage pour persister entre les sessions.

## Implémentation de la méthode AHP

### Étape 1 : Définition des alternatives et des critères

Les alternatives (téléphones) et les critères sont définis dans le fichier script.js :

```javascript
// Alternatives (téléphones)
const phones = [
    { name: "Iphone 12", memory: 4, storage: 128, cpuFreq: 2.99, price: 800, brand: 9 },
    { name: "Itel A56", memory: 2, storage: 32, cpuFreq: 1.3, price: 100, brand: 3 },
    // ... autres téléphones
];

// Critères
const criteria = ["Mémoire", "Stockage", "Fréquence CPU", "Prix", "Marque"];
```

### Étape 2 : Normalisation des données

Les données des téléphones sont normalisées pour chaque critère afin de les rendre comparables :

```javascript
function normalizePhoneData(phones) {
    // Créer une copie profonde des téléphones
    const normalizedPhones = JSON.parse(JSON.stringify(phones));
    
    // Trouver les valeurs min et max pour chaque critère
    const minMax = {
        memory: { min: Infinity, max: -Infinity },
        // ... autres critères
    };
    
    // Calculer min et max pour chaque critère
    phones.forEach(phone => {
        minMax.memory.min = Math.min(minMax.memory.min, phone.memory);
        // ... autres critères
    });
    
    // Normaliser les valeurs (0-1)
    normalizedPhones.forEach(phone => {
        // Pour la mémoire, le stockage, la fréquence CPU et la marque, plus c'est élevé, mieux c'est
        phone.memory = (phone.memory - minMax.memory.min) / (minMax.memory.max - minMax.memory.min);
        // ... autres critères
        
        // Pour le prix, moins c'est élevé, mieux c'est (inverser la normalisation)
        phone.price = 1 - (phone.price - minMax.price.min) / (minMax.price.max - minMax.price.min);
    });
    
    return normalizedPhones;
}
```

### Étape 3 : Comparaison par paires des critères

L'utilisateur saisit la matrice de comparaison des critères via l'interface. La matrice est récupérée avec la fonction suivante :

```javascript
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
```

### Étape 4 : Calcul des poids des critères

Les poids des critères sont calculés à partir de la matrice de comparaison :

```javascript
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
```

### Étape 5 : Vérification de la cohérence

La cohérence des comparaisons est vérifiée en calculant le ratio de cohérence (CR) :

```javascript
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
```

### Étape 6 : Calcul des scores des alternatives

Les scores des téléphones sont calculés en utilisant les poids des critères :

```javascript
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
```

## Fonctionnalités clés

### Matrice de comparaison interactive

La matrice de comparaison est interactive et met automatiquement à jour les valeurs réciproques :

```javascript
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
    
    // Mettre à jour la cellule réciproque
    const table = document.getElementById('criteria-table');
    const reciprocalCell = table.rows[cellIndex + 1].cells[rowIndex + 1];
    const reciprocalInput = reciprocalCell.querySelector('input');
    
    // Mettre à jour la valeur réciproque
    reciprocalInput.value = value;
    reciprocalInput.disabled = true;
}
```

### Visualisation des résultats

Les résultats sont visualisés à l'aide de graphiques à barres générés dynamiquement :

```javascript
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
```

### Mode sombre

Le mode sombre est implémenté à l'aide de variables CSS et du localStorage :

```javascript
function initTheme() {
    // Vérifier si un thème est enregistré dans le localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

## Guide du code

### HTML (index.html)

Le fichier HTML est structuré en sections claires :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Métadonnées et liens vers les ressources externes -->
</head>
<body>
    <div class="container">
        <header>
            <!-- En-tête de l'application -->
        </header>

        <main>
            <section class="intro">
                <!-- Introduction et instructions -->
            </section>

            <section class="criteria-matrix">
                <!-- Matrice de comparaison des critères -->
            </section>

            <section id="results-section" class="results hidden">
                <!-- Résultats de l'analyse AHP -->
            </section>
        </main>

        <footer>
            <!-- Pied de page -->
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### CSS (style.css)

Le CSS utilise des variables pour faciliter la gestion des thèmes :

```css
:root {
    /* Variables pour le mode clair */
    --primary-color: #4a6fa5;
    --background-color: #f8f9fa;
    --text-color: #333333;
    /* ... autres variables */
}

[data-theme="dark"] {
    /* Variables pour le mode sombre */
    --primary-color: #5d8acd;
    --background-color: #121212;
    --text-color: #e0e0e0;
    /* ... autres variables */
}
```

### JavaScript (script.js)

Le JavaScript est organisé en fonctions claires avec des commentaires explicatifs :

```javascript
// Données des téléphones et critères
const phones = [ /* ... */ ];
const criteria = [ /* ... */ ];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // ... initialisation
});

// Fonctions pour la gestion du thème
function initTheme() { /* ... */ }
function toggleTheme() { /* ... */ }

// Fonctions pour la matrice de comparaison
function initMatrix() { /* ... */ }
function updateReciprocalValue(input) { /* ... */ }
function resetMatrix() { /* ... */ }

// Fonctions pour la méthode AHP
function calculateResults() { /* ... */ }
function getCriteriaMatrix() { /* ... */ }
function calculateCriteriaWeights(matrix) { /* ... */ }
function calculateConsistencyRatio(matrix, weights) { /* ... */ }
function normalizePhoneData(phones) { /* ... */ }
function calculatePhoneScores(normalizedPhones, weights) { /* ... */ }

// Fonctions pour l'affichage des résultats
function displayResults(phoneScores, criteriaWeights, consistencyRatio) { /* ... */ }
function displayCriteriaWeightsChart(weights) { /* ... */ }
function displayPhoneScoresChart(scores) { /* ... */ }
function displayDetailedResults(scores, consistencyRatio) { /* ... */ }
```

## Améliorations possibles

Voici quelques améliorations qui pourraient être apportées à l'application :

1. **Persistance des données** : Sauvegarder les préférences de l'utilisateur dans le localStorage
2. **Personnalisation des alternatives** : Permettre à l'utilisateur d'ajouter ou de modifier les téléphones
3. **Personnalisation des critères** : Permettre à l'utilisateur d'ajouter ou de modifier les critères
4. **Exportation des résultats** : Ajouter une fonction pour exporter les résultats en PDF ou CSV
5. **Visualisations avancées** : Ajouter des graphiques plus sophistiqués (camemberts, radars)
6. **Comparaison directe** : Ajouter une vue pour comparer directement deux téléphones
7. **Internationalisation** : Ajouter le support de plusieurs langues
8. **Tests unitaires** : Ajouter des tests pour garantir la fiabilité des calculs

## Conclusion

Cette application démontre comment la méthode AHP peut être implémentée dans une application web simple et intuitive. Elle permet aux utilisateurs de prendre des décisions complexes en décomposant le problème en critères et en évaluant l'importance relative de chaque critère.

Le code est organisé de manière claire et modulaire, ce qui facilite la maintenance et les améliorations futures. L'interface utilisateur est responsive et propose un mode sombre pour améliorer l'expérience utilisateur.
