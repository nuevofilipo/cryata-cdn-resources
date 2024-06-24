//! defining the chart and other chart elements ----------------------------------------------
let urlParamsProcessedCoin = false;
let urlParamsProcessedTf = false;
const mainSection = document.getElementById("tvchart");
const chartProperties = {
  height: getMainHeight() ,
  width: getMainWidth(),
  layout: {
    background: { color: "#000" },
    textColor: "#C3BCDB",
  },
  grid: {
    vertLines: { color: "#444", visible:false },
    horzLines: { color: "#444", visible: false },
  },
};
const domElement = document.getElementById("tvchart");
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();

function getMainHeight() {
  return mainSection.clientHeight;
}
function getMainWidth() {
  return mainSection.clientWidth;
}




// creating lines for the 4 line indicator
const maLine1 = chart.addLineSeries({ color: "#3d4654", lineWidth: 2, priceLineVisible: false });
const maLine2 = chart.addLineSeries({ color: "#2196F3", lineWidth: 2 , priceLineVisible: false});
const emaLine1 = chart.addLineSeries({ color: "violet", lineWidth: 1, priceLineVisible: false });
const emaLine2 = chart.addLineSeries({ color: "violet", lineWidth: 1, priceLineVisible: false });


// creating lines for the varv indicator
const band1 = chart.addLineSeries({ color: "rgb(243, 152, 33)", lineWidth: 1, priceLineVisible: false });
const band2 = chart.addLineSeries({ color: "rgb(170, 243, 33)", lineWidth: 1, priceLineVisible: false });
const band3 = chart.addLineSeries({ color: "rgb(33, 243, 86)", lineWidth: 1, priceLineVisible: false });
const band4 = chart.addLineSeries({ color: "rgb(33, 243, 173)", lineWidth: 1, priceLineVisible: false });
const band5 = chart.addLineSeries({ color: "rgb(33, 184, 243)", lineWidth: 1, priceLineVisible: false });
const band6 = chart.addLineSeries({ color: "rgb(33, 72, 243)", lineWidth: 1, priceLineVisible: false });
const band7 = chart.addLineSeries({ color: "rgb(33, 65, 243)", lineWidth: 1, priceLineVisible: false });
const band8 = chart.addLineSeries({ color: "rgb(47, 33, 243)", lineWidth: 1, priceLineVisible: false });
const band9 = chart.addLineSeries({ color: "rgb(149, 33, 243)", lineWidth: 1, priceLineVisible: false });
const band10 = chart.addLineSeries({ color: "rgb(236, 33, 243)", lineWidth: 1, priceLineVisible: false });
const band11 = chart.addLineSeries({ color: "rgb(243, 33, 61)", lineWidth: 1, priceLineVisible: false });


let addedSupplyZones = new Map();
let addedRanges = new Map();


//! functions for fetching data asyncronously ----------------------------------------------
// for use with local data
async function getData(route){
  changeTimeFrameFromUrl();
  const selectedBtn = document.querySelector(".active");
  const response = await fetch(
    `http://127.0.0.1:5000/api/${route}/?coin=${updateCoin()}&timeframe=${selectedBtn.value}` 
  )
  const data = await response.json();
  return data;
}

async function getRangesData(range_value){
  const selectedBtn = document.querySelector(".active");
  const response = await fetch(
    `http://127.0.0.1:5000/api/ranges/?coin=${updateCoin()}&timeframe=${selectedBtn.value}&ranges=${range_value}` 
  )
  const data = await response.json();
  return data;

}

async function getDataIndividualTimeframe(endpoint, additionalParameter,  indicatorTimeframe){
  const chartTimeframe = document.querySelector('.tablinks.active').getAttribute('data-timeframe');
  const response = await fetch(
    `http://127.0.0.1:5000/api/${endpoint}/?coin=${updateCoin()}&timeframe=${chartTimeframe}&${additionalParameter}=${indicatorTimeframe}` 
  )
  const data = await response.json();
  return data;
    
}

// for use with external hosted data
// async function getData(route){
//   changeTimeFrameFromUrl();
//   const selectedBtn = document.querySelector(".active");
//   const response = await fetch(
//     `https://new-cryata-backend-production.up.railway.app//api/${route}/?coin=${updateCoin()}&timeframe=${selectedBtn.value}` 
//   )
  
//   const data = await response.json();
//   return data;
// }

// async function getRangesData(range_value){
//   const selectedBtn = document.querySelector(".active");
//   const response = await fetch(
//     `https://new-cryata-backend-production.up.railway.app/api/ranges/?coin=${updateCoin()}&timeframe=${selectedBtn.value}&ranges=${range_value}` 
//   )
  
//   const data = await response.json();
//   return data;

// }

// async function getDataIndividualTimeframe(endpoint, additionalParameter,  indicatorTimeframe){
//   const chartTimeframe = document.querySelector('.tablinks.active').getAttribute('data-timeframe');
//   const response = await fetch(
//     `https://new-cryata-backend-production.up.railway.app/api/${endpoint}/?coin=${updateCoin()}&timeframe=${chartTimeframe}&${additionalParameter}=${indicatorTimeframe}` 
//   )

//   const data = await response.json();
//   return data;
    
// }

//! functions for creating and removing boxes and ranges----------------------------------------------
async function createBoxesData(mapping, data, color, key){
  list = [];
  // const data = data;
  data.forEach(element => {
    color = element.hasOwnProperty("color") ? element["color"] : color;
    const i = candleSeries.createBox({
        lowPrice: element["y0"],
        highPrice: element["y1"],
        earlyTime: element["x0"] / 1000,
        lateTime: element["x1"] / 1000,
        borderColor: '#00008B',
        borderWidth: 2,
        borderStyle: LightweightCharts.LineStyle.Solid,
        fillColor: color,
        fillOpacity: 0.5,
        borderVisible: false,
        axisLabelVisible: false,
        title: 'My box',
      })
      list.push(i);
    });
  mapping.set(key, list);
  return true;
}

async function createRangesData(mapping, data, color, key){
  list = [];
  data.forEach(element => {
    const i = candleSeries.createBox({
        corners: [{ time: element["x0"] / 1000, price: element["y0"] }, { time: element["x1"] / 1000, price: element["y1"] }],
        borderColor: color,
        borderWidth: 2,
        borderStyle: LightweightCharts.LineStyle.Solid,
        fillColor: color,
        fillOpacity: 0.4,
        borderVisible: true,
        axisLabelVisible: false,
        title: 'My box',
      })
      list.push(i);
    });
  mapping.set(key, list);
  }

function removeBoxesMap(mapping, key){
  boxes = mapping.get(key);
  boxes.forEach(element => {
    candleSeries.removeBox(element);
  });
  mapping.delete(key);
}




//! functions for setting Line and Chart data----------------------------------------------

async function setData(){
  const data = await getData("query"); 
  const cdata = data.map((d) => {
    try {
      returnState = {
        time: d.time / 1000, 
        open: parseFloat(d.Open),
        high: parseFloat(d.High),
        low: parseFloat(d.Low),
        close: parseFloat(d.Close),
        movingAverage: parseFloat(d.MA),
        ema: parseFloat(d.EMA),
      };
    } catch {
      returnState = {
        time: d.time / 1000, 
        open: parseFloat(d.Open),
        high: parseFloat(d.High),
        low: parseFloat(d.Low),
        close: parseFloat(d.Close),
      };
    }
    return returnState;
    
  });

  turnOffLoader();

  candleSeries.setData(cdata);
  chart.priceScale("right").applyOptions({
    autoScale: true,
    mode: 1,
  });
  chart.timeScale().applyOptions({
    timeVisible: true,
  })
  chart.resize(getMainWidth(), getMainHeight());


}

// setting context bands data
async function setLineData(){
  if (indicatorState() == true){
  data = await getData("4lines");
  const maDownShift = data.map((d) => {
    return { value: parseFloat(d.MA)*0.62, time: d.time / 1000 };
  });
  const maUpShift = data.map((d) => {
    return { value: parseFloat(d.MA)*1.62, time: d.time / 1000 };
  });
  const emaDownShift = data.map((d) => {
    return { value: parseFloat(d.EMA)*0.79, time: d.time / 1000 };
  });
  const emaUpShift = data.map((d) => {
    return { value: parseFloat(d.EMA)*1.21, time: d.time / 1000 };
  });  
  maLine1.setData(maDownShift);
  maLine2.setData(maUpShift);
  emaLine1.setData(emaDownShift);
  emaLine2.setData(emaUpShift);
  } else if (indicatorState() == false){
    maLine1.setData([]);
    maLine2.setData([]);
    emaLine1.setData([]);
    emaLine2.setData([]);
  }
}

async function setVarvData(){
  if (varvIndicatorState() == true){
  data = await getData("varv");
  if (data.length == 0 ){
    showNotification('Data not available');
    const varvSwitch = document.getElementById("varv-indicator-switch");
    varvSwitch.click();
    return;
  }  else if(varvIndicatorState() == false){
    removeVarvData();
    console.log("in if statement after await");
    return;
  }

  const band1Data = data.map((d) => {
    return { value: parseFloat(d.out1), time: d.time / 1000 };
  });
  const band2Data = data.map((d) => {
    return { value: parseFloat(d.out2), time: d.time / 1000 };
  });
  const band3Data = data.map((d) => {
    return { value: parseFloat(d.out3), time: d.time / 1000 };
  });
  const band4Data = data.map((d) => {
    return { value: parseFloat(d.out4), time: d.time / 1000 };
  });
  const band5Data = data.map((d) => {
    return { value: parseFloat(d.out5), time: d.time / 1000 };
  });
  const band6Data = data.map((d) => {
    return { value: parseFloat(d.out6), time: d.time / 1000 };
  });
  const band7Data = data.map((d) => {
    return { value: parseFloat(d.out7), time: d.time / 1000 };
  });
  const band8Data = data.map((d) => {
    return { value: parseFloat(d.out8), time: d.time / 1000 };
  });
  const band9Data = data.map((d) => {
    return { value: parseFloat(d.out9), time: d.time / 1000 };
  });
  const band10Data = data.map((d) => {
    return { value: parseFloat(d.out10), time: d.time / 1000 };
  });
  const band11Data = data.map((d) => {
    return { value: parseFloat(d.out11), time: d.time / 1000 };
  });
  band1.setData(band1Data);
  band2.setData(band2Data);
  band3.setData(band3Data);
  band4.setData(band4Data);
  band5.setData(band5Data);
  band6.setData(band6Data);
  band7.setData(band7Data);
  band8.setData(band8Data);
  band9.setData(band9Data);
  band10.setData(band10Data);
  band11.setData(band11Data);
  } else if (varvIndicatorState() == false){
    removeVarvData();
  }
}

async function removeVarvData(){
  band1.setData([]);
  band2.setData([]);
  band3.setData([]);
  band4.setData([]);
  band5.setData([]);
  band6.setData([]);
  band7.setData([]);
  band8.setData([]);
  band9.setData([]);
  band10.setData([]);
  band11.setData([]);
}

// function for setting all at once
function setAll(){
  setData();
  setLineData();
  setVarvData();
  updateIndividualIndicatorsTimeframe();
}



//! manipulate coin and timeframe from url ----------------------------------------------

function getUrlParameterCoin() {
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('coin');
  return myParam;
}

function getUrlParameterTimeframe() {
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get('timeframe');
  return myParam;
}

function updateCoin(){
  if (getUrlParameterCoin() != null && !urlParamsProcessedCoin){
    document.getElementById("coin-selector").value = getUrlParameterCoin();
    urlParamsProcessedCoin = true;
    return getUrlParameterCoin();    
  }
  const selectedCoin = document.getElementById("coin-selector").value;
  return selectedCoin;
}

function changeTimeFrameFromUrl(){
  if (getUrlParameterTimeframe() != null && !urlParamsProcessedTf){
    const selectedTimeframe = getUrlParameterTimeframe();
    const buttons = document.querySelectorAll('.tablinks');
    buttons.forEach(button => {
      if (button.getAttribute('data-timeframe') == selectedTimeframe){
        button.classList.add('active');
      } else if (button.classList.contains('active')){
        button.classList.remove('active');
      }
    });
    urlParamsProcessedTf = true;
  }
  const selectedBtn = document.querySelector(".active");
  return selectedBtn.value;
}

//! updating and changing timeframes && small timeframe-btns-----------------------------------
// changes main timeframe
function updateTimeframe(event, timeframe) {
  var i, tablinks;

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  event.currentTarget.className += " active";

  // Save the selected timeframe to localStorage
  localStorage.setItem('selectedTimeframe', timeframe);

  setAll();
  
}

// this makes timeframe buttons with smaller tf unclickable
function updateIndividualIndicatorsTimeframe(){
  const individualTimeframeButtons = document.querySelectorAll('.timeframe-btn');
  const timeframeRanks = {
    '1h': 1,
    '4h': 2,
    '1day': 3,
    '1week': 4,
    '1m': 5,
    '3m': 6,
    '1y': 7,

  };
  const selectedTimeframe = document.querySelector('.tablinks.active').getAttribute('data-timeframe');
  const selectedRank = timeframeRanks[selectedTimeframe];

  individualTimeframeButtons.forEach(button => {
    const buttonTimeframe = button.getAttribute('data-timeframe');
    const buttonRank = timeframeRanks[buttonTimeframe];
    const indicatorType = button.getAttribute('data-indicator');

    if (buttonRank < selectedRank) {
      button.disabled = true;
      button.classList.add('disabled');
      if (button.classList.contains('active')) {
        button.classList.remove('active');
        removeBoxesMap(addedSupplyZones, indicatorType + buttonTimeframe);
      }
    } else {
      button.disabled = false;
      button.classList.remove('disabled');
    }
  });
}

// this resets indicators that get activated by the small timeframe buttons
function updateSmallIndicatorCoin(){
  const buttons = document.querySelectorAll('.timeframe-btn');
  buttons.forEach(button => {
    const indTime = button.getAttribute('data-timeframe');
    const indicator = button.getAttribute('data-indicator');
    const type = button.getAttribute('data-type');
    const color = button.getAttribute('data-color');
    if (button.classList.contains('active')) {
      if (type == "boxes"){
        removeBoxesMap(addedSupplyZones, indicator + indTime);
        createBoxesData(addedSupplyZones, getDataIndividualTimeframe( indicator, "indicatorTimeframe",  indTime), color, indicator + indTime );
      } else if (type == "lineSeries"){
        removeBoxesMap(addedRanges, indicator + indTime);
        createRangesData(addedRanges, getDataIndividualTimeframe( indicator, "indicatorTimeframe",  indTime), color, indicator + indTime);
      }
    }
  });
}





//! state functions ----------------------------------------------

// context bands
function indicatorState(){
  const indicatorSwitch = document.getElementById("indicator-switch");
  if (indicatorSwitch.checked){
    return true;
  }
  else if (indicatorSwitch.checked == false){
    return false;
  }
}


function varvIndicatorState(){
  const varvSwitch = document.getElementById("varv-indicator-switch");
  if (varvSwitch.checked){
    return true;
  }
  else if (varvSwitch.checked == false){
    return false;
  }
}


//!html functionality ----------------------------------------------
// function to show notification that data is not available
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
      notification.classList.remove('show');
  }, 3000); // Hide after 3 seconds
}

var hidden = false;

function hideSidebar(){
  var sidebar = document.getElementById("sidebar");
  var main = document.getElementById("main");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  if (!hidden){
  sidebar.classList.add("hidden");
  main.style.width = "100%";
  sidebarToggle.classList.add("on");
  sidebarToggle.innerHTML = "<i class='fa fa-angle-double-right'>";
  sidebarToggle.style.color = "white";
  chart.resize(getMainWidth(), getMainHeight());
  hidden = true;
  } else {
    sidebar.classList.remove("hidden");
    main.style.width = "100%"
    sidebarToggle.classList.remove("on");
    sidebarToggle.innerHTML = "<i class='fa fa-angle-double-left'>";
    sidebarToggle.style.color = "black";
    chart.resize(getMainWidth(), getMainHeight());
    hidden = false;
  }
}

// Function to format the symbols and add them to the select element
function populateSelect() {
  const symbols = [ "NEARUSDT", "LTCUSDT",
    "DAIUSDT", "LEOUSDT", "UNIUSDT", "APTUSDT", "STXUSDT", "ETCUSDT",
     "FILUSDT", "RNDRUSDT", "ATOMUSDT", "XLMUSDT",
    "OKBUSDT", "HBARUSDT", "ARUSDT", "IMXUSDT", "TAOUSDT", "VETUSDT",
    "WIFUSDT", "MKRUSDT", "KASUSDT", "GRTUSDT", "INJUSDT", "OPUSDT",
    "PEPEUSDT", "THETAUSDT", "RUNEUSDT", "FTMUSDT", "FETUSDT", "TIAUSDT",
    "LDOUSDT", "FLOKIUSDT", "BGBUSDT", "ALGOUSDT", "COREUSDT", "BONKUSDT",
    "SEIUSDT", "JUPUSDT", "FLOWUSDT", "ENAUSDT", "GALAUSDT", "AAVEUSDT",
    "BSVUSDT", "BEAMUSDT", "DYDXUSDT", "QNTUSDT", "AKTUSDT", "BTTUSDT",
    "AGIXUSDT", "SXPUSDT", "WLDUSDT", "FLRUSDT", "WUSDT", "CHZUSDT",
    "PENDLEUSDT", "ONDOUSDT", "EGLDUSDT", "NEOUSDT", "AXSUSDT", "KCSUSDT",
    "SANDUSDT", "XECUSDT", "AIOZUSDT", "EOSUSDT", "XTZUSDT", "STRKUSDT",
    "JASMYUSDT", "MINAUSDT", "RONUSDT", "CFXUSDT", "SNXUSDT", "MANAUSDT",
    "ORDIUSDT", "GNOUSDT", "GTUSDT", "CKBUSDT", "APEUSDT", "BOMEUSDT",
    "DEXEUSDT", "BLURUSDT", "FRONTUSDT", "FXSUSDT", "DOGUSDT", "ROSEUSDT",
    "SAFEUSDT", "LPTUSDT", "KLAYUSDT", "CAKEUSDT", "USDDUSDT", "AXLUSDT",
    "HNTUSDT", "BTGUSDT", "WOOUSDT", "1INCHUSDT", "MANTAUSDT", "CRVUSDT",
    "IOTXUSDT", "ASTRUSDT", "PRIMEUSDT", "FTTUSDT", "TUSDUSDT", "BICOUSDT",
    "TWTUSDT", "MEMEUSDT", "OSMOUSDT", "ARKMUSDT", "BNXUSDT", "WEMIXUSDT",
    "DYMUSDT", "COMPUSDT", "SUPERUSDT", "GLMUSDT", "NFTUSDT", "RAYUSDT",
    "LUNAUSDT", "GMTUSDT", "OCEANUSDT", "PAXGUSDT", "RPLUSDT", "XRDUSDT",
    "POLYXUSDT", "ANTUSDT", "JTOUSDT", "ZILUSDT", "MXUSDT", "PYUSDUSDT",
    "ANKRUSDT", "HOTUSDT", "CELOUSDT", "ZRXUSDT", "ZECUSDT", "SSVUSDT",
    "METISUSDT", "ENJUSDT", "GMXUSDT", "ILVUSDT", "GALUSDT", "IDUSDT",
    "TRACUSDT", "RVNUSDT", "RSRUSDT", "SFPUSDT", "SKLUSDT", "ABTUSDT",
    "ETHWUSDT", "SCUSDT", "ELFUSDT", "QTUMUSDT", "ALTUSDT", "BATUSDT",
    "YGGUSDT", "CSPRUSDT", "PEOPLEUSDT", "LUNCUSDT"
  ];
  const selectElement = document.getElementById('coin-selector');
  symbols.forEach(symbol => {
      const formattedSymbol = `${symbol.slice(0, -4)}/${symbol.slice(-3, -3)}USD`;
      const option = document.createElement('option');
      option.value = formattedSymbol;
      option.textContent = formattedSymbol.replace("USDT", "");
      selectElement.appendChild(option);
  });
}

// turns of loader once data gets loaded
function turnOffLoader(){
  var tvchartelems = document.querySelectorAll(".tvchartbeforeload");
  [].forEach.call(tvchartelems, function(el) {
    el.classList.remove("tvchartbeforeload");
  });

  var loader = document.querySelectorAll(".loader");
  [].forEach.call(loader, function(el) {
    el.classList.remove("loader");
  });
}

function setSavedTimeframe(){
  const savedTimeframe = localStorage.getItem('selectedTimeframe');
    
  if (savedTimeframe){
      const button = document.querySelector(`.tablinks[data-timeframe="${savedTimeframe}"]`);
          button.classList.add('active');
  } else {
      const defaultButton = document.querySelector('.tablinks[data-timeframe="1day"]');
      if (defaultButton) {
          defaultButton.classList.add('active');
      }
  }
}

//! element listeners ----------------------------------------------
// context bands
const switchElement = document.getElementById("indicator-switch");
switchElement.addEventListener("change", function(){
  setLineData();
})


const varvSwitchElement = document.getElementById("varv-indicator-switch");
varvSwitchElement.addEventListener("change", function(){
  setVarvData();
});

// small individual timeframe buttons activation!!
const Buttons = document.querySelectorAll('.timeframe-btn');
Buttons.forEach(button => {
    button.addEventListener('click', async function() {
        button.disabled = true;
        this.classList.toggle('active');
        const indTime = button.getAttribute('data-timeframe');
        const indicator = button.getAttribute('data-indicator');
        const type = button.getAttribute('data-type');
        const color = button.getAttribute('data-color');
        if (button.classList.contains('active')) {
          const data = await getDataIndividualTimeframe( indicator, "indicatorTimeframe",  indTime);
          try {
            if (data.length == 0) throw new Error("No data available");
            if (type  == "boxes"){
                createBoxesData(addedSupplyZones, data, color, indicator + indTime );  
            } else if (type == "lineSeries"){
              createRangesData(addedRanges, data, color, indicator + indTime);
            }
          } catch{
            button.classList.remove('active');
            showNotification('Data not available');
          }
        } else {
          if (type == "boxes"){
            removeBoxesMap(addedSupplyZones, indicator + indTime);
          } else if (type == "lineSeries"){
            removeBoxesMap(addedRanges, indicator + indTime);
          }
        }

        button.disabled = false;
    });
});

window.addEventListener("resize", () => {
  chart.resize(getMainWidth(), getMainHeight());
  console.log("resized");
});



//! first function calls on page load ----------------------------------------------
// populateSelect(); // populate the coin selector
setSavedTimeframe(); // set the saved timeframe
setData(); // initial data fetch and set
updateIndividualIndicatorsTimeframe(); // initial setting of small timeframe buttons
