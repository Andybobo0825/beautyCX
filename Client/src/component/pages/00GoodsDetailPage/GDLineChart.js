// chart.js
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
} from "chart.js";

// 註冊組件 (只需要一次)
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip
);

export function DrawPriceChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  // 避免重複繪製
  if (window.priceChartInstance) {
    window.priceChartInstance.destroy();
  }

  // 按日期排序 (舊 → 新)
  const sortedData = [...data].sort(
    (a, b) => new Date(a.updateTime) - new Date(b.updateTime)
  );

  window.priceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedData.map((item) => item.updateTime), // X 軸：日期
      datasets: [
        {
          label: "價格",
          data: sortedData.map((item) => item.prePrice), // Y 軸：價格
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          fill: false,
          tension: 0.2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `$${context.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "日期" },
        },
        y: {
          title: { display: true, text: "價格 (NTD)" },
          beginAtZero: false,
        },
      },
    },
  });
}
