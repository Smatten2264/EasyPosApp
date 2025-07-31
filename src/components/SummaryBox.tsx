import React, { JSX } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";

// Reusable metric card
const MetricCard = ({
  title,
  value,
  index,
}: {
  title: string;
  value: string;
  index: string;
}) => (
  <Box
    sx={{
      backgroundColor: "#fff",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      padding: "1rem",
      textAlign: "center",
    }}
  >
    <Typography fontSize="0.9rem" color="text.secondary">
      {title}
    </Typography>
    <Typography fontWeight="bold" fontSize="1.5rem">
      {value}
    </Typography>
    <Typography fontSize="1rem" color="text.secondary">
      {index}
    </Typography>
  </Box>
);

const SummaryBox = (): JSX.Element => {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        padding: "2rem",
        marginBottom: "2rem",
        border: "1px solid #e0e0e0",
      }}
    >
      <Typography
        sx={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151", mb: 3 }}
      >
        Total
      </Typography>

      {/* Responsive grid layout for metrics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Omsætning/Index" value="0 kr" index="0,00%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="DB/DG" value="0 kr" index="0,00%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Eksp/Index" value="0 stk" index="0%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Gns. køb/Index" value="0 kr" index="0%" />
        </Grid>
      </Grid>

      {/* Chart section */}
      <Box
        sx={{
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          padding: "1.25rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <Typography fontWeight={600} mb={2} color="#374151">
          Omsætning
        </Typography>

        <BarChart
          xAxis={[{ scaleType: "band", data: ["Periode", "Sammenlign"] }]}
          series={[
            { data: [0, null], color: "#1976d2" },
            { data: [null, 0], color: "#f50057" },
          ]}
          height={200}
        />
      </Box>
    </Box>
  );
};

export default SummaryBox;
