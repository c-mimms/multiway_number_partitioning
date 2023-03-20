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
  const groups = bruteForceSolution(data);

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
}

function bruteForceSolution(data) {
  const allPartitions = [];
  const partitions = Array(3)
    .fill()
    .map(() => []);

  function generatePartitions(index) {
    if (index === data.length) {
      allPartitions.push(partitions.map(partition => partition.slice()));
      return;
    }

    for (let i = 0; i < 3; i++) {
      partitions[i].push(data[index]);
      generatePartitions(index + 1);
      partitions[i].pop();
    }
  }

  generatePartitions(0);

  let bestPartitions = null;
  let bestScore = Infinity;

  for (const partition of allPartitions) {
    const sums = partition.map(group =>
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

    if (maxSum < bestScore) {
      bestScore = maxSum;
      bestPartitions = partition;
    }
  }

  return bestPartitions;
}
