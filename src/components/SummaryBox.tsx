import React, { JSX } from "react";
import { BarChart } from "@mui/x-charts";

const SummaryBox = (): JSX.Element => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        padding: "2rem",
        marginBottom: "2rem",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "1.5rem",
        }}
      >
        Total
      </div>

      <div
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <p>
          <strong>Omsætning/Index:</strong> 0 kr / 0,00 %
        </p>
        <p>
          <strong>DB/DG:</strong> 0 kr / 0,00 %
        </p>
        <p>
          <strong>Eksp/Index:</strong> 0 stk / 0 %
        </p>
        <p>
          <strong>Gns. køb/Index:</strong> 0 kr / 0 %
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: "12px",
          padding: "1.25rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{ fontWeight: 600, marginBottom: "1rem", color: "#374151" }}
        >
          Omsætning
        </div>

        <BarChart
          xAxis={[{ scaleType: "band", data: ["Periode", "Sammenlign"] }]}
          series={[
            { data: [36000, null], color: "#1976d2" },
            { data: [null, 26500], color: "#f50057" },
          ]}
          height={200}
        />
      </div>
    </div>
  );
};

export default SummaryBox;
