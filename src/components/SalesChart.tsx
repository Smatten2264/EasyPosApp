import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

interface SalesChartProps {
  labels: string[];
  values: number[];
}

const SalesChart: React.FC<SalesChartProps> = ({ labels, values }) => {
  if (labels.length !== values.length || values.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography fontWeight="bold" mb={2}>
        Omsætningssammenligning:
      </Typography>

      <BarChart
        xAxis={[{ scaleType: 'band', data: labels }]}
        series={[{ data: values, color: '#1976d2' }]}
        height={300}
      />
    </Box>
  );
};

export default SalesChart;
