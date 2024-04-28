// Function to add a new row to the table
function addRow(index, coin, price, priceChange, fourLineIndicator, varvIndicator, momentum, volatilityMean, volatilityMedian) {
  var table = document.getElementById("cryptoTable");
  var row = table.insertRow(-1); // Insert row at the end of the table

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell3b = row.insertCell(3);
  if (priceChange > 0) {
      cell3b.style.color = "#34eb67";
  } else if (priceChange === 0) {
      cell3b.style.color = "yellow";
  } else if (priceChange < 0){
      cell3b.style.color = "red";
  } else {
      cell3b.style.color = "white";
  }
  

  var cell4 = row.insertCell(4);
  var cell5 = row.insertCell(5);
  var cell6 = row.insertCell(6);
  var cell7 = row.insertCell(7);
  var cell8 = row.insertCell(8);

  cell1.innerHTML = index;
  cell2.innerHTML = coin;
  cell3.innerHTML = price;
  cell3b.innerHTML = String(priceChange) + " %";
  // cell3b.innerHTML = priceChange;
  cell4.innerHTML = fourLineIndicator;
  cell4.style.color = "black";

  if (fourLineIndicator === 2) {
      cell4.style.color = "#e61220";
      cell4.textContent = "massive short potential";
  } else if (fourLineIndicator === 1) {
      cell4.style.color = "#e66a12";
      cell4.textContent = "short potential";
  } else if (fourLineIndicator === 0) {
      cell4.style.color = "#e6bf12";
      cell4.textContent = "ranging";
  } else if (fourLineIndicator === -1) {
      cell4.style.color = "#cbff30";
      cell4.textContent = "long potential";
  } else if (fourLineIndicator === -2){
      cell4.style.color = "#00de60";
      cell4.textContent = "massive long potential";
  }




  cell5.innerHTML = varvIndicator;

  // adding arrows for momentum
  if (momentum === 1) {
      cell6.innerHTML = '<span style="font-size:30px; color: #33ff77;">&#8593;</span>'; // Upward arrow

  } else if (momentum === -1) {
      cell6.innerHTML = '<span style="font-size:30px; color: red;">&#8595;</span>'; // Downward arrow
  } else {
      cell6.innerHTML = '<span style="font-size:30px; color: orange;">&#8594;</span>'; // No arrow if momentumIndicator is neither 1 nor -1
  }




  cell7.innerHTML = volatilityMean;
  cell8.innerHTML = volatilityMedian;
  
}

// Object to keep track of sorting state for the current column
var sortingState = {
columnIndex: null,
order: null
};

function sortTable(columnIndex) {
var table, rows, switching, i, x, y, shouldSwitch;
table = document.getElementById("cryptoTable");
switching = true;

// Reset sorting state for other columns if a new column is clicked
if (sortingState.columnIndex !== columnIndex) {
  sortingState.columnIndex = columnIndex;
  sortingState.order = 'asc'; // Default to ascending order
} else {
  // Toggle sorting order if the same column is clicked again
  sortingState.order = sortingState.order === 'asc' ? 'desc' : 'asc';
}

while (switching) {
  switching = false;
  rows = table.rows;

  for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[columnIndex];
      y = rows[i + 1].getElementsByTagName("td")[columnIndex];

      // Compare content based on sorting state for the column
      if (sortingState.order === 'asc') {
          if (compareCells(x, y) > 0) {
              shouldSwitch = true;
              break;
          }
      } else {
          if (compareCells(x, y) < 0) {
              shouldSwitch = true;
              break;
          }
      }
  }

  if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
  }
}
}

// Function to compare cell content
function compareCells(cellX, cellY) {
var contentX = cellX.innerHTML.toLowerCase();
var contentY = cellY.innerHTML.toLowerCase();

if (!isNaN(parseFloat(contentX)) && !isNaN(parseFloat(contentY))) {
  // If content is numeric, compare numerically
  return parseFloat(contentX) - parseFloat(contentY);
} else {
  // If content is non-numeric, compare as strings
  return contentX.localeCompare(contentY);
}
}



//Actual API call

async function getTableViewData(tableName){
  const response = await fetch(`https://table-view-api-production.up.railway.app/?name=${tableName}`);
  const data = await response.json();
  console.log(data);
  return data;
}

// Loop through API response and add rows to the table
async function main(timeframe){
  const data = await getTableViewData("table"+timeframe);
  var varvDailyData = null;
  if (timeframe !== "1d"){
      varvDailyData = await getTableViewData("table1d");
  }
  const varvIndicator = (timeframe === "1d") ? data.map(entry => entry.varvIndicator) : varvDailyData.map(entry => entry.varvIndicator);

  var priceChangeData = null;
  if (timeframe !== "1h"){
      priceChangeData = await getTableViewData("table1h");
  }
  const priceChange = (timeframe === "1h") ? data.map(entry => entry.priceChange) : priceChangeData.map(entry => entry.priceChange);
  // console.log(data);
  data.forEach(function(entry, index) {
      addRow(entry.index, entry.coin, entry.price, priceChange[index], entry.fourLineIndicator, varvIndicator[index], entry.momentumIndicator, entry.volatilityMeanAbsolute, entry.volatilityMedianAbsolute);
  });
}

main("1d");

async function changeTimeFrame(timeframe){
  // reset table
  var table = document.getElementById("cryptoTable");
  table.innerHTML = "<tr><th onclick='sortTable(0)'>#</th><th onclick='sortTable(1)'>Coin</th><th onclick='sortTable(2)'>Price (USD)</th><th onclick='sortTable(3)'>Change 24h</th><th onclick='sortTable(4)'>Context Bands</th><th onclick='sortTable(5)'>Varv</th><th onclick='sortTable(6)'>Momentum</th><th onclick='sortTable(7)'>VolatilityMean</th><th onclick='sortTable(8)'>VolatilityMedian</th></tr>";
  main(timeframe);
  console.log("Timeframe changed to: " + timeframe);
}