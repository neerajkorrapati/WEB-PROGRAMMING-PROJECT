let chart;
let candleSeries;
let volumeSeries;
let currentStockData = null;
let myPortfolio = JSON.parse(localStorage.getItem('userPortfolio')) || [];

window.onload = function () {
    initChart();
    renderPortfolio();
};

function initChart() {
    const container = document.getElementById("priceChart");

    chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 550,
        layout: {
            background: { color: "#161b22" },
            textColor: "#d1d4dc"
        }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: "#00ff88",
        downColor: "#ff4d4d",
        borderVisible: false,
        wickUpColor: "#00ff88",
        wickDownColor: "#ff4d4d"
    });

    volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: ""
    });

    chart.priceScale("").applyOptions({
        scaleMargins: {
            top: 0.8,
            bottom: 0
        }
    });
}

async function fetchStock() {
    const ticker = document.getElementById("tickerInput").value.trim().toUpperCase();
    if (!ticker) return alert("Enter stock symbol");

    try {
        const response = await fetch(`/stock/${ticker}`);
        const data = await response.json();

        if (!data["Global Quote"]) {
            alert("Invalid stock or API limit reached.");
            return;
        }

        const quote = data["Global Quote"];
        currentStockData = quote;

        const price = parseFloat(quote["05. price"]);
        const high = parseFloat(quote["03. high"]);
        const low = parseFloat(quote["04. low"]);

        document.getElementById("main-price").innerText = `₹${price.toFixed(2)}`;
        document.getElementById("main-high").innerText = `₹${high.toFixed(2)}`;
        document.getElementById("main-low").innerText = `₹${low.toFixed(2)}`;
        document.getElementById("display-name").innerText =
            `${quote["01. symbol"]} | ALGORITHMIC VIEW`;

        const volRate = ((high - low) / low * 100).toFixed(2);
        document.getElementById("volatility-rate").innerText = `${volRate}%`;

        generateFakeData(price);

    } catch (err) {
        console.error(err);
        alert("Frontend error. Check console.");
    }
}

function generateFakeData(basePrice) {
    const candles = [];
    const volumes = [];
    let price = basePrice;

    for (let i = 0; i < 60; i++) {
        const open = price + (Math.random() - 0.5) * 5;
        const close = open + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;

        const time = Math.floor(Date.now() / 1000) - (60 - i) * 86400;

        candles.push({ time, open, high, low, close });

        volumes.push({
            time,
            value: Math.random() * 1000000,
            color: close > open
                ? "rgba(0,255,136,0.5)"
                : "rgba(255,77,77,0.5)"
        });

        price = close;
    }

    candleSeries.setData(candles);
    volumeSeries.setData(volumes);

    chart.timeScale().fitContent();
}

function addToPortfolio() {
    if (!currentStockData) return alert("Search stock first");

    const symbol = currentStockData["01. symbol"];

    if (myPortfolio.some(s => s.symbol === symbol)) {
        return alert("Already added");
    }

    myPortfolio.push({
        symbol,
        price: currentStockData["05. price"]
    });

    localStorage.setItem("userPortfolio", JSON.stringify(myPortfolio));
    renderPortfolio();
}

function renderPortfolio() {
    const list = document.getElementById("portfolio-list");

    if (myPortfolio.length === 0) {
        list.innerHTML = "<div style='opacity:0.5'>No stocks added</div>";
        return;
    }

    list.innerHTML = myPortfolio.map((stock, index) => `
        <div class="list-item">
            <span>${stock.symbol}</span>
            <span>₹${parseFloat(stock.price).toFixed(2)}</span>
            <button class="remove-btn" onclick="removeStock(${index})">X</button>
        </div>
    `).join("");
}

function removeStock(index) {
    myPortfolio.splice(index, 1);
    localStorage.setItem("userPortfolio", JSON.stringify(myPortfolio));
    renderPortfolio();
}