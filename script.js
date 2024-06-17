// Dane punktów ATT48:
const points = [
    {x: 6734, y: 1453}, {x: 2233, y: 400}, {x: 5530, y: 1424},
    {x: 1400, y: 2400}, {x: 3082, y: 1644}, {x: 7608, y: 4458},
    {x: 7573, y: 3716}, {x: 7265, y: 1268}, {x: 6898, y: 1885},
    {x: 1112, y: 2049}, {x: 5468, y: 2606}, {x: 5989, y: 2873},
    {x: 4706, y: 2674}, {x: 4612, y: 2035}, {x: 6347, y: 2683},
    {x: 6100, y: 5100}, {x: 7611, y: 5184}, {x: 7462, y: 3590},
    {x: 7732, y: 4723}, {x: 5900, y: 3561}, {x: 4483, y: 3369},
    {x: 6101, y: 1110}, {x: 5199, y: 2182}, {x: 1633, y: 2809},
    {x: 4307, y: 2322}, {x: 6750, y: 1006}, {x: 7155, y: 4819},
    {x: 7541, y: 3981}, {x: 3177, y: 7565}, {x: 7352, y: 4506},
    {x: 7545, y: 2801}, {x: 3245, y: 3305}, {x: 6426, y: 3173},
    {x: 4608, y: 1198}, {x: 430, y: 2216}, {x: 7648, y: 3779},
    {x: 7762, y: 4595}, {x: 7392, y: 2244}, {x: 3484, y: 2829},
    {x: 6271, y: 2135}, {x: 4985, y: 800}, {x: 1916, y: 1569},
    {x: 7280, y: 4899}, {x: 7509, y: 3239}, {x: 800, y: 2676},
    {x: 6807, y: 2993}, {x: 5185, y: 3258}, {x: 3023, y: 1942},
    // Dodatkowe punkty do wizualizacji
    {x: 1500, y: 4500}, {x: 3000, y: 6000}, {x: 4500, y: 7500},
    {x: 6000, y: 4500}, {x: 7500, y: 3000}, {x: 7000, y: 6000},
    {x: 4500, y: 1500}, {x: 6000, y: 7000}, {x: 7500, y: 7500},
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

// Funkcje algorytmu genetycznego:
function tournamentSelection(population, scores) { //selekcja metodą turniejową
    const tournamentSize = 5;
    let bestIndex = Math.floor(Math.random() * population.length);
    for (let i = 1; i < tournamentSize; i++) {
        let index = Math.floor(Math.random() * population.length);
        if (scores[index] < scores[bestIndex]) bestIndex = index;
    }
    return population[bestIndex];
}

function crossover(parent1, parent2) {          //krzyżowanie (Crossover z jednopunktową wymianą genów)
    let start = Math.floor(Math.random() * parent1.length);
    let end = start + Math.floor(Math.random() * (parent1.length - start));
    let child = parent1.slice(start, end);
    for (let city of parent2) {
        if (!child.includes(city)) child.push(city);
    }
    return child;
}

function mutate(route, mutationRate) {          //mutacja przez zamianę miast
    for (let i = 0; i < route.length; i++) {
        if (Math.random() < mutationRate) {
            let j = Math.floor(Math.random() * route.length);
            [route[i], route[j]] = [route[j], route[i]];
        }
    }
}

//Ocena Fitness
function calculateDistance(route) {     //ocena na podstawie długości trasy
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        totalDistance += Math.sqrt(
            Math.pow(points[route[i]].x - points[route[i + 1]].x, 2) +
            Math.pow(points[route[i]].y - points[route[i + 1]].y, 2)
        );
    }
    totalDistance += Math.sqrt(
        Math.pow(points[route[route.length - 1]].x - points[route[0]].x, 2) +
        Math.pow(points[route[route.length - 1]].y - points[route[0]].y, 2)
    );
    return totalDistance;
}

//Główna pętla algorytmu
function evolve(population, iterations, mutationRate) {     //pętla ewolucji
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
    }
    return population;
}

// Funkcja runAlgorithm (funkcja uruchamiająca algorytm)
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

    const finalPopulation = evolve(population, iterations, mutationRate);
    const bestRoute = finalPopulation.reduce((best, current) =>
        calculateDistance(current) < calculateDistance(best) ? current : best, finalPopulation[0]);

    visualizeRoute(bestRoute);
}

// Funkcja visualizeRoute do wizualizacji trasy
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

    // Rysowanie miast
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    for (let i = 0; i < points.length; i++) {
        const { x, y } = points[i];
        ctx.beginPath();
        ctx.arc(x / 10, y / 10, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rysowanie trasy
    ctx.beginPath();
    ctx.moveTo(points[route[0]].x / 10, points[route[0]].y / 10);
    for (let i = 1; i < route.length; i++) {
        ctx.lineTo(points[route[i]].x / 10, points[route[i]].y / 10);
    }
    ctx.closePath();
    ctx.stroke();

    // Rysowanie skali
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';

    // Oznaczenia na osi X
    ctx.fillText('0', 10, canvas.height - 20);
    ctx.fillText('400', 400 / 10, canvas.height - 20);
    ctx.fillText('800', 800 / 10, canvas.height - 20);
    ctx.fillText('1200', 1200 / 10, canvas.height - 20);
    ctx.fillText('1600', 1600 / 10, canvas.height - 20);
    ctx.fillText('2000', 2000 / 10, canvas.height - 20);
    ctx.fillText('2400', 2400 / 10, canvas.height - 20);
    ctx.fillText('2800', 2800 / 10, canvas.height - 20);
    ctx.fillText('3200', 3200 / 10, canvas.height - 20);
    ctx.fillText('3600', 3600 / 10, canvas.height - 20);
    ctx.fillText('4000', 4000 / 10, canvas.height - 20);
    ctx.fillText('4400', 4400 / 10, canvas.height - 20);
    ctx.fillText('4800', 4800 / 10, canvas.height - 20);
    ctx.fillText('5200', 5200 / 10, canvas.height - 20);
    ctx.fillText('5600', 5600 / 10, canvas.height - 20);
    ctx.fillText('6000', 6000 / 10, canvas.height - 20);
    ctx.fillText('6400', 6400 / 10, canvas.height - 20);
    ctx.fillText('6800', 6800 / 10, canvas.height - 20);
    ctx.fillText('7200', 7200 / 10, canvas.height - 20);
    ctx.fillText('7600', 7600 / 10, canvas.height - 20);
    ctx.fillText('8000', 8000 / 10, canvas.height - 20);

    // Oznaczenia na osi Y
    ctx.fillText('0', 5, 15);
    ctx.fillText('400', 5, 400 / 10);
    ctx.fillText('800', 5, 800 / 10);
    ctx.fillText('1200', 5, 1200 / 10);
    ctx.fillText('1600', 5, 1600 / 10);
    ctx.fillText('2000', 5, 2000 / 10);
    ctx.fillText('2400', 5, 2400 / 10);
    ctx.fillText('2800', 5, 2800 / 10);
    ctx.fillText('3200', 5, 3200 / 10);
    ctx.fillText('3600', 5, 3600 / 10);
    ctx.fillText('4000', 5, 4000 / 10);
    ctx.fillText('4400', 5, 4400 / 10);
    ctx.fillText('4800', 5, 4800 / 10);
    ctx.fillText('5200', 5, 5200 / 10);
    ctx.fillText('5600', 5, 5600 / 10);
    ctx.fillText('6000', 5, 6000 / 10);
    ctx.fillText('6400', 5, 6400 / 10);
    ctx.fillText('6800', 5, 6800 / 10);
    ctx.fillText('7200', 5, 7200 / 10);
    ctx.fillText('7600', 5, 7600 / 10);
    ctx.fillText('8000', 5, 8000 / 10);

    // Rysowanie linii poziomych
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 9; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * canvas.height / 10);
        ctx.lineTo(canvas.width, i * canvas.height / 10);
        ctx.stroke();
    }
}