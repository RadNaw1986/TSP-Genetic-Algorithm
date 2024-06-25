// Dane punktów ATT48:
const points = [
    { x: 6734, y: 1453 }, { x: 2233, y: 10 }, { x: 5530, y: 1424 },
    { x: 401, y: 8410 }, { x: 3082, y: 1644 }, { x: 7608, y: 4458 },
    { x: 7573, y: 3716 }, { x: 7265, y: 1268 }, { x: 6898, y: 1885 },
    { x: 1112, y: 2049 }, { x: 5468, y: 2606 }, { x: 5989, y: 2873 },
    { x: 4706, y: 2674 }, { x: 4612, y: 2035 }, { x: 6347, y: 2683 },
    { x: 6107, y: 669 }, { x: 7611, y: 5184 }, { x: 7462, y: 3590 },
    { x: 7732, y: 4723 }, { x: 5900, y: 3561 }, { x: 4483, y: 3369 },
    { x: 6101, y: 1110 }, { x: 5199, y: 2182 }, { x: 1633, y: 2809 },
    { x: 4307, y: 2322 }, { x: 6750, y: 1006 }, { x: 7555, y: 4819 },
    { x: 7541, y: 3981 }, { x: 3177, y: 7565 }, { x: 7352, y: 4506 },
    { x: 7545, y: 2801 }, { x: 3245, y: 3305 }, { x: 6426, y: 3173 },
    { x: 4608, y: 1198 }, { x: 23, y: 2216 }, { x: 7248, y: 3779 },
    { x: 7762, y: 4595 }, { x: 7392, y: 2244 }, { x: 3484, y: 2829 },
    { x: 6271, y: 2135 }, { x: 4985, y: 140 }, { x: 1916, y: 1569 },
    { x: 7280, y: 4899 }, { x: 7509, y: 3239 }, { x: 10, y: 2676 },
    { x: 6807, y: 2993 }, { x: 5185, y: 3258 }, { x: 3023, y: 1942 }
];

// Inicjalizacja populacji:
let population = [];

function initializePopulation(populationSize) {
    population = [];
    for (let i = 0; i < populationSize; i++) {
        let route = [...Array(points.length).keys()];
        route.sort(() => Math.random() - 0.5);
        population.push(route);
    }
}

// Selekcja turniejowa:
function tournamentSelection(population, scores) {
    const tournamentSize = 5;
    let bestIndex = Math.floor(Math.random() * population.length);
    for (let i = 1; i < tournamentSize; i++) {
        let index = Math.floor(Math.random() * population.length);
        if (scores[index] < scores[bestIndex]) bestIndex = index;
    }
    return population[bestIndex];
}

// Krzyżowanie (OX1 - Order Crossover):
function crossover(parent1, parent2) {
    let start = Math.floor(Math.random() * parent1.length);
    let end = start + Math.floor(Math.random() * (parent1.length - start));
    let child = new Array(parent1.length).fill(-1);
    let segment = parent1.slice(start, end);
    child.splice(start, end - start, ...segment);
    let currentIndex = end % parent1.length;
    parent2.forEach(city => {
        if (!child.includes(city)) {
            child[currentIndex] = city;
            currentIndex = (currentIndex + 1) % parent1.length;
        }
    });
    return child;
}

// Mutacja (zamiana dwóch miast):
function mutate(route, mutationRate) {
    for (let i = 0; i < route.length; i++) {
        if (Math.random() < mutationRate) {
            let j = Math.floor(Math.random() * route.length);
            [route[i], route[j]] = [route[j], route[i]];
        }
    }
}

// Ocena długości trasy:
function calculateDistance(route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        totalDistance += Math.sqrt(
            Math.pow(points[route[i]].x - points[route[i + 1]].x, 2) +
            Math.pow(points[route[i + 1]].y - points[route[i]].y, 2)
        );
    }
    totalDistance += Math.sqrt(
        Math.pow(points[route[route.length - 1]].x - points[route[0]].x, 2) +
        Math.pow(points[route[route.length - 1]].y - points[route[0]].y, 2)
    );
    return totalDistance;
}

// Ewolucja:
function evolve(population, iterations, mutationRate) {
    for (let i = 0; i < iterations; i++) {
        let scores = population.map(route => calculateDistance(route));
        let newPopulation = [];
        for (let j = 0; j < population.length; j++) {
            let parent1 = tournamentSelection(population, scores);
            let parent2 = tournamentSelection(population, scores);
            let child = crossover(parent1, parent2);
            mutate(child, mutationRate);
            newPopulation.push(child);
        }
        population = newPopulation;

        // Wizualizacja aktualnej najlepszej trasy
        const bestRoute = population.reduce((best, current) =>
            calculateDistance(current) < calculateDistance(best) ? current : best, population[0]);
        visualizeRoute(bestRoute);
    }
    return population;
}

// Uruchomienie algorytmu:
function runAlgorithm() {
    const populationSize = parseInt(document.getElementById('populationSize').value);
    const iterations = parseInt(document.getElementById('iterations').value);
    const mutationRate = parseFloat(document.getElementById('mutationRate').value);

    // Walidacja wejściowa
    if (isNaN(populationSize) || populationSize <= 0) {
        alert("Wprowadź poprawną liczebność populacji.");
        return;
    }
    if (isNaN(iterations) || iterations <= 0) {
        alert("Wprowadź poprawną liczbę iteracji.");
        return;
    }
    if (isNaN(mutationRate) || mutationRate < 0 || mutationRate > 1) {
        alert("Wprowadź poprawne prawdopodobieństwo mutacji (0 - 1).");
        return;
    }

    initializePopulation(populationSize);
    evolve(population, iterations, mutationRate);
}

// Wizualizacja trasy:
function visualizeRoute(route) {
    // Usuń poprzednie płótno
    const existingCanvas = document.querySelector('#visualization canvas');
    if (existingCanvas) existingCanvas.remove();

    // Utwórz i ustaw płótno
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 800;
    canvas.style.border = '1px solid black';
    document.getElementById('visualization').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Znajdź maksymalne wartości X i Y, aby dynamicznie ustalić skalę
    const maxX = Math.max(...points.map(point => point.x));
    const maxY = Math.max(...points.map(point => point.y));
    const margin = 0.1; // Margines 10% maksymalnej wartości
    const scaleX = canvas.width / (maxX * (1 + margin));
    const scaleY = canvas.height / (maxY * (1 + margin));
    const scale = Math.min(scaleX, scaleY);

    // Rysowanie miast
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';
    for (let i = 0; i < points.length; i++) {
        const { x, y } = points[i];
        const scaledX = x * scale;
        const scaledY = y * scale;
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Etykieta punktu
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(`X: ${x}, Y: ${y}`, scaledX + 5, scaledY - 5);
    }

    // Rysowanie trasy
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[route[0]].x * scale, points[route[0]].y * scale);
    for (let i = 1; i < route.length; i++) {
        ctx.lineTo(points[route[i]].x * scale, points[route[i]].y * scale);
    }
    ctx.closePath();
    ctx.stroke();

    // Oznaczenia na osi X
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    for (let i = 0; i <= Math.ceil(maxX * (1 + margin) / 1000) * 1000; i += 1000) {
        const scaledX = i * scale;
        ctx.fillText(i.toString(), scaledX, canvas.height - 10);
    }

    // Oznaczenia na osi Y
    for (let i = 0; i <= Math.ceil(maxY * (1 + margin) / 1000) * 1000; i += 1000) {
        const scaledY = i * scale;
        ctx.fillText(i.toString(), 10, canvas.height - scaledY);
    }

    // Rysowanie linii siatki
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= Math.ceil(maxX * (1 + margin) / 1000); i++) {
        const scaledX = i * 1000 * scale;
        ctx.beginPath();
        ctx.moveTo(scaledX, 0);
        ctx.lineTo(scaledX, canvas.height);
        ctx.stroke();
    }
    for (let i = 1; i <= Math.ceil(maxY * (1 + margin) / 1000); i++) {
        const scaledY = i * 1000 * scale;
        ctx.beginPath();
        ctx.moveTo(0, scaledY);
        ctx.lineTo(canvas.width, scaledY);
        ctx.stroke();
    }
}

// Inicjalizacja strony:
window.onload = function () {
    const controlsDiv = document.createElement('div');
    controlsDiv.innerHTML = `
        <label for="populationSize">Liczebność populacji:</label>
        <input type="number" id="populationSize" value="50"><br>
        <label for="iterations">Liczba iteracji:</label>
        <input type="number" id="iterations" value="100"><br>
        <label for="mutationRate">Prawdopodobieństwo mutacji:</label>
        <input type="number" id="mutationRate" value="0.01" step="0.01"><br>
        <button onclick="runAlgorithm()">Uruchom Algorytm</button>
    `;
    document.body.insertBefore(controlsDiv, document.getElementById('visualization'));
};
