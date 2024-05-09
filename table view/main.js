// Function to add a new row to the table
      function addRow(
        index,
        coin,
        price,
        priceChange,
        contextBands,
        varvIndicator,
        momentum,
        volatilityMean,
        meanPerformance,
        medianPerformance
      ) {
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
        } else if (priceChange < 0) {
          cell3b.style.color = "red";
        } else {
          cell3b.style.color = "white";
        }

        var cell4 = row.insertCell(4);
        var cell5 = row.insertCell(5);
        var cell6 = row.insertCell(6);
        var cell7 = row.insertCell(7);
        var cell8 = row.insertCell(8);
        var cell9 = row.insertCell(9);

        cell1.innerHTML = index;
        cell2.innerHTML = coin;
        cell3.innerHTML = price;
        cell3b.innerHTML = String(priceChange) + " %";
        // cell3b.innerHTML = priceChange;
        cell4.innerHTML = contextBands;
        cell4.style.color = "black";

        if (contextBands === 2 || contextBands === 1) {
          cell4.style.color = "#e61220";
          cell4.textContent = "short potential";
        } else if (contextBands === 0) {
          cell4.style.color = "#e6bf12";
          cell4.textContent = "ranging";
        } else if (contextBands === -1 || contextBands === -2) {
          cell4.style.color = "#00de60";
          cell4.textContent = "long potential";
        }

        if (varvIndicator === 0) {
          cell5.innerHTML = "below";
        } else if (varvIndicator === 11) {
          cell5.innerHTML = "above";
        } else {
          cell5.innerHTML = varvIndicator;
        }

        // adding arrows for momentum
        if (momentum === 1) {
          cell6.innerHTML =
            '<span style="font-size:30px; color: #33ff77;">&#8593;</span>'; // Upward arrow
        } else if (momentum === -1) {
          cell6.innerHTML =
            '<span style="font-size:30px; color: red;">&#8595;</span>'; // Downward arrow
        } else {
          cell6.innerHTML =
            '<span style="font-size:30px; color: orange;">&#8594;</span>'; // No arrow if momentumIndicator is neither 1 nor -1
        }

        cell7.innerHTML = volatilityMean;
        cell8.innerHTML = meanPerformance;
        cell9.innerHTML = medianPerformance;
      }

      // Object to keep track of sorting state for the current column
      var sortingState = {
        columnIndex: null,
        order: null,
      };

      function sortTable(columnIndex) {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("cryptoTable");
        switching = true;

        // Reset sorting state for other columns if a new column is clicked
        if (sortingState.columnIndex !== columnIndex) {
          sortingState.columnIndex = columnIndex;
          sortingState.order = "asc"; // Default to ascending order
        } else {
          // Toggle sorting order if the same column is clicked again
          sortingState.order = sortingState.order === "asc" ? "desc" : "asc";
        }

        while (switching) {
          switching = false;
          rows = table.rows;

          for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[columnIndex];
            y = rows[i + 1].getElementsByTagName("td")[columnIndex];

            // Compare content based on sorting state for the column
            if (sortingState.order === "asc") {
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

      async function getTableViewData(tableName) {
        const response = await fetch(`https://table-view-api-production.up.railway.app/?name=${tableName}`);
        // const response = await fetch(
        //   `http://127.0.0.1:5000/?name=${tableName}`
        // );
        const data = await response.json();
        return data;
      }

      // Loop through API response and add rows to the table
      async function main(timeframe) {
        const data = await getTableViewData("table" + timeframe);
        var DailyData = null;
        var varvIndicator = [];
        var contextBands = [];
        var volatilityMean = [];
        if (timeframe !== "1d") {
          DailyData = await getTableViewData("table1d");
          varvIndicator = data.map((entry) => {
            const dailyEntry = DailyData.find(
              (dailyEntry) => dailyEntry.coin === entry.coin
            );
            return dailyEntry ? dailyEntry.varvIndicator : "undefined";
          });
          contextBands = data.map((entry) => {
            const dailyEntry = DailyData.find(
              (dailyEntry) => dailyEntry.coin === entry.coin
            );
            return dailyEntry ? dailyEntry.contextBands : "undefined";
          });
          volatilityMean = data.map((entry) => {
            const dailyEntry = DailyData.find(
              (dailyEntry) => dailyEntry.coin === entry.coin
            );
            if (dailyEntry) {
              const key = `volatilityMean${timeframe}`;
              volatilityMean = dailyEntry[key];
              return volatilityMean;
            } else {
              return "undefined";
            }
          });
        } else {
          varvIndicator = data.map((entry) => entry.varvIndicator);
          contextBands = data.map((entry) => entry.contextBands);
          volatilityMean = data.map((entry) => entry.volatilityMean1d);
        }

        console.log(DailyData);

        data.forEach(function (entry, index) {
          addRow(
            entry.index,
            entry.coin,
            entry.price,
            entry.priceChange,
            contextBands[index],
            varvIndicator[index],
            entry.momentumIndicator,
            volatilityMean[index],
            entry.meanPerformance,
            entry.medianPerformance
          );
        });
      }

      main("1d");

      async function changeTimeFrame(timeframe) {
        // reset table
        var table = document.getElementById("cryptoTable");
        table.innerHTML =
          "<tr><th onclick='sortTable(0)'>#</th><th onclick='sortTable(1)'>Coin</th><th onclick='sortTable(2)'>Price (USD)</th><th onclick='sortTable(3)'>Change %</th><th onclick='sortTable(4)'>Context Bands</th><th onclick='sortTable(5)'>Varv</th><th onclick='sortTable(6)'>Momentum</th><th onclick='sortTable(7)'>VolatilityMean</th><th onclick='sortTable(8)'>Mean Performance</th><th onclick='sortTable(9)'>median Performance</th></tr>";
        main(timeframe);
        console.log("Timeframe changed to: " + timeframe);
      }
