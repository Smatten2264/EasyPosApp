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
        label: "Omsætning", 
        data: values, // y-akse værdier (eks. 1.000.000 kr.)
        backgroundColor: colors ?? ["#1976d2", "#1976d2"], // fallback: blå
        borderRadius: 6, // afrundede hjørner på søjler
        barPercentage: 0.5, // bredde på søjler relativt til "slot"
      },
    ],
  };

  // Konfiguration af grafens udseende og funktionalitet
const options: ChartOptions<"bar"> = {
  responsive: true, // Diagrammet skalerer automatisk til containerens bredde/højde
  plugins: {
    legend: { display: false }, // Vi viser ikke nogen forklaringsboks/legend
    tooltip: {
      callbacks: {
        // Bestem hvad der står i tooltippen ved hover
        label: (context: TooltipItem<"bar">) => {
          const val = context.raw as number;
          // Formatér tal som dansk valuta (DKK)
          return val.toLocaleString("da-DK", {
            style: "currency",
            currency: "DKK",
          });
        },
      },
    },
    datalabels: {
      anchor: "end", // Placer label over søjlens top
      align: "end", // Justér til toppen af søjlen
      font: {
        weight: "bold", // Fed skrift så tallene er tydelige
      },
      formatter: (value: number) =>
        // Formatér datalabel som valuta uden decimaler
        value.toLocaleString("da-DK", {
          style: "currency",
          currency: "DKK",
          minimumFractionDigits: 0,
        }),
      color: "#000", // Sort tekstfarve til datalabel
      clip: false, // Sørger for at teksten må være udenfor canvas
    },
  },
  scales: {
    y: {
      ticks: {
        // Formatér Y-akse værdier som dansk valuta
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
        padding: 10, // Lidt ekstra luft mellem akse-tal og datalabels
      },
      // Her har jeg lavet fixet til mit problem = at mine tal forsvandt i min container.
      // Jeg finder største værdi i datasættet (Math.max(...values))
      // Ganger med 1.15 for at give ca. 15% ekstra højde
      // Dermed er der altid luft til datalabels, så de ikke bliver klippet
      suggestedMax: Math.max(...values) * 1.15,
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
