document.getElementById('processButton').addEventListener('click', processData);

let data = [];

function parseData() {
  const dataInput = document.getElementById('dataInput').value;
  const dataPreview = document.getElementById('dataPreview');

  let dataRows = dataInput.split('\n');
  data = dataRows.map(row => {
    const [label, ...values] = row.split('\t');
    return { label, values: values.map(Number) };
  });

  let html = '<table><tbody>';
  data.forEach(row => {
    html += '<tr>';
    html += `<td>${row.label}</td>`;
    row.values.forEach(value => {
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  dataPreview.innerHTML = html;
}

function processData() {
  const resultDiv = document.getElementById('result');
  const groups = geneticAlgorithm(data, 3, 1000, 0.1, 200);

  let html = '';
  for (let i = 0; i < groups.length; i++) {
    const sums = groups[i].reduce(
      (acc, item) => {
        acc[0] += item.values[0];
        acc[1] += item.values[1];
        return acc;
      },
      [0, 0]
    );
    html += `<h3>Group ${i + 1}:</h3>`;
    html += `<p>Size: ${groups[i].length}</p>`;
    html += `<p>Sums: ${sums.join(', ')}</p>`;
    html += '<ul>';
    for (let j = 0; j < groups[i].length; j++) {
      html += `<li>${groups[i][j].label}: ${groups[i][j].values.join(', ')}</li>`;
    }
    html += '</ul>';
  }
  resultDiv.innerHTML = html;

  displayFitnessChart();
}

function geneticAlgorithm(data, numGroups, populationSize, mutationRate, generations) {
  // Generate initial population
  let population = generateInitialPopulation(data, numGroups, populationSize);

  const fitnessHistory = [];

  for (let i = 0; i < generations; i++) {
    population = nextGeneration(population, mutationRate);

    // Calculate average fitness of the population
    const averageFitness = population.reduce((sum, chromosome) => sum + fitness(chromosome), 0) / population.length;
    fitnessHistory.push(averageFitness);
  }

  const bestChromosome = population.reduce((best, chromosome) => {
    const bestFitness = fitness(best);
    const currFitness = fitness(chromosome);
    return bestFitness < currFitness ? best : chromosome;
  });

  const groups = chromosomeToGroups(bestChromosome, data);

  return {
    groups,
    fitnessHistory
  };
}

function generateInitialPopulation(data, numGroups, populationSize) {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    const chromosome = data.map(() => Math.floor(Math.random() * numGroups));
    population.push(chromosome);
  }
  return population;
}

function nextGeneration(population, mutationRate) {
  const newPopulation = [];
  const numElite = 2;

  // Elitism
  population.sort((a, b) => fitness(b) - fitness(a));
  for (let i = 0; i < numElite; i++) {
    newPopulation.push(population[i]);
  }

  // Selection, crossover, and mutation
  for (let i = numElite; i < population.length; i++) {
    const parentA = selectParent(population);
    const parentB = selectParent(population);
    let child = crossover(parentA, parentB);
    child = mutate(child, mutationRate);
    newPopulation.push(child);
  }

  return newPopulation;
}

function selectParent(population) {
  const tournamentSize = 5;
  let best = null;

  for (let i = 0; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    const competitor = population[idx];
    if (best === null || fitness(competitor) > fitness(best)) {
      best = competitor;
    }
  }

  return best;
}

function crossover(parentA, parentB) {
  const crossoverPoint = Math.floor(Math.random() * parentA.length);
  const child = parentA.slice(0, crossoverPoint).concat(parentB.slice(crossoverPoint));
  return child;
}

function mutate(chromosome, mutationRate) {
  const mutated = chromosome.slice();

  for (let i = 0; i < chromosome.length; i++) {
    if (Math.random() < mutationRate) {
      mutated[i] = Math.floor(Math.random() * 3);
    }
  }

  return mutated;
}

function fitness(chromosome) {
  const groups = chromosomeToGroups(chromosome, data);
  const sums = groups.map(group =>
    group.reduce(
      (acc, item) => {
        acc[0] += item.values[0];
        acc[1] += item.values[1];
        return acc;
      },
      [0, 0]
    )
  );

  const maxSum = Math.max(
    Math.abs(sums[0][0] - sums[1][0]),
    Math.abs(sums[0][0] - sums[2][0]),
    Math.abs(sums[1][0] - sums[2][0]),
    Math.abs(sums[0][1] - sums[1][1]),
    Math.abs(sums[0][1] - sums[2][1]),
    Math.abs(sums[1][1] - sums[2][1])
  );

  return 1 / (1 + maxSum);
}

function chromosomeToGroups(chromosome, data) {
  const groups = Array(3)
    .fill()
    .map(() => []);

  for (let i = 0; i < chromosome.length; i++) {
    const groupIdx = chromosome[i];
    groups[groupIdx].push(data[i]);
  }

  return groups;
}

function displayFitnessChart() {
  const { fitnessHistory } = geneticAlgorithm(data, 3, 100, 0.1, 200);

  const chartData = {
    labels: Array.from({ length: fitnessHistory.length }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Average Fitness',
        data: fitnessHistory,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Generation',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Average Fitness',
        },
      },
    },
  };

  const chartCanvas = document.getElementById('fitnessChart').getContext('2d');
  new Chart(chartCanvas, {
    type: 'line',
    data: chartData,
    options: chartOptions,
  });
}
