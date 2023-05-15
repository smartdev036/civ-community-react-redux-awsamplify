import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// import faker from 'faker';

export const options = {
  responsive: true,
  interaction: {
    mode: "index",
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: "Historical Risk Score",
    },
  },
  scales: {
    y: {
      type: "linear",
      display: true,
      position: "left",
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

// export const options = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false,
//     },
//   },
// };

export function LineChart({ chartData, county }) {
  const isValidChartData = chartData["0"] !== 0;
  let data = {};
  let options = {};

  if (isValidChartData) {
    const labels = Object.keys(chartData.K);

    Object.entries(labels).forEach(([key, value]) => {
      delete labels[key];
      const dt = value.substring(2);
      labels[key] = dt.substring(0, 2) + "/" + dt.substring(2, 4);
    });

    const kValues = Object.values(chartData.K);
    const kStateHistorical = Object.values(chartData.state_historical);
    const kUSHistorical = Object.values(chartData.us_historical);

    // delete values.K;
    // delete values.state_historical;
    // delete values.us_historical;

    options = {
      responsive: true,
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 25,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
          },
          title: {
            display: true,
            text: "Historical Risk Score",
            font: {
              size: 20,
            },
          },
        },
      },
    };

    data = {
      labels,
      datasets: [
        {
          label: chartData.county_name,
          data: kValues,
          borderColor: "#01B13A",
          backgroundColor: "#01B13A",
          pointStyle: "rect",
          // yAxisID: 'y',
        },
        {
          label: chartData.state,
          data: kStateHistorical,
          borderColor: "#D56C87",
          backgroundColor: "#D56C87",
          pointStyle: "rect",
          // yAxisID: 'y1',
        },
        {
          label: "USA",
          data: kUSHistorical,
          borderColor: "#7800B0",
          backgroundColor: "#7800B0",
          pointStyle: "rect",
          // yAxisID: 'y1',
        },
      ],
    };
  }

  return (
    <div>
      {!isValidChartData ? (
        <div id="noId" class="noData">
          <span>Data for this county is currently unavailable</span>
          <div></div>
        </div>
      ) : (
        <div id="showId" class="showData">
          <Line options={options} data={data} />
        </div>
      )}
    </div>
  );
}

// rename LIneChart to LineChart
