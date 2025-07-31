// Importer nødvendige moduler og komponenter fra Chart.js
import {
  Chart as ChartJS,
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Tooltip, 
  Legend, 
  ChartOptions, 
  TooltipItem, 
} from "chart.js";

// plugin til at vise tal direkte på søjlerne
import ChartDataLabels from "chartjs-plugin-datalabels";

// wrapper til Chart.js
import { Bar } from "react-chartjs-2";

// komponenter til styling
import { Box, Typography } from "@mui/material";

// Registrér de valgte komponenter og plugins i ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels // nødvendigt for at datalabels virker
);

// Komponentens props: labels = datoer, values = omsætningstal, colors = søjlefarver
const SalesChart = ({
  labels,
  values,
  colors,
}: {
  labels: string[];
  values: number[];
  colors?: string[]; // valgfri – fallback er blå
}) => {
  // Datastruktur til bar-chartet
  const data = {
    labels, // x-akse labels (datoer)
    datasets: [
      {
        label: "Omsætning", // bruges kun til tooltips eller legend
        data: values, // y-akse værdier (eks. 1.000.000 kr.)
        backgroundColor: colors ?? ["#1976d2", "#1976d2"], // fallback: blå
        borderRadius: 6, // afrundede hjørner på søjler
        barPercentage: 0.5, // bredde på søjler relativt til "slot"
      },
    ],
  };

  // Konfiguration af grafens udseende og funktionalitet
  const options: ChartOptions<"bar"> = {
    responsive: true, // gør grafen responsiv
    plugins: {
      legend: { display: false }, // vi viser ikke nogen legend
      tooltip: {
        callbacks: {
          // Custom tekst i tooltip (når man hover)
          label: (context: TooltipItem<"bar">) => {
            const val = context.raw as number;
            return val.toLocaleString("da-DK", {
              style: "currency",
              currency: "DKK",
            });
          },
        },
      },
      // Plugin: Vis omsætningstal direkte ovenpå søjlerne
      datalabels: {
        anchor: "end", // placér label over søjlen
        align: "end",
        font: {
          weight: "bold",
        },
        formatter: (value: number) =>
          value.toLocaleString("da-DK", {
            style: "currency",
            currency: "DKK",
            minimumFractionDigits: 0, // eks. "1.200.000 kr."
          }),
        color: "#000", // tekstfarve: sort
      },
    },
    scales: {
      y: {
        ticks: {
          // Formatér y-aksen til dansk valuta
          callback: function (tickValue) {
            if (typeof tickValue === "number") {
              return tickValue.toLocaleString("da-DK", {
                style: "currency",
                currency: "DKK",
                minimumFractionDigits: 0,
              });
            }
            return tickValue;
          },
        },
      },
    },
  };

  // Returnér den færdige komponent med overskrift og graf
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Omsætningssammenligning:
      </Typography>
      {/* Selve grafen */}
      <Bar data={data} options={options} />
    </Box>
  );
};

export default SalesChart;
