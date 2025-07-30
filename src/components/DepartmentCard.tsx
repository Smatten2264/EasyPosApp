// components/DepartmentCard.tsx

import { Box, Typography } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

interface Props {
  name: string;
  omsaetning: string;
  index: string;
  eksp: string;
  gnsKoeb: string;
}

const getColor = (value: number) => {
  return value >= 100 ? "green" : "red";
};

const DepartmentCard: React.FC<Props> = ({
  name,
  omsaetning,
  index,
  eksp,
  gnsKoeb,
}) => {
  // Udtræk procenter fra tekststrenge
  const indexVal = parseFloat(index);
  const ekspVal = parseFloat(eksp.split("/")[1]);
  const gnsKoebVal = parseFloat(gnsKoeb.split("/")[1]);

  return (
    <Box sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2, boxShadow: 1 }}>
      <Typography fontWeight="bold" mb={1}>
        <StoreIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        {name}
      </Typography>

      <Typography>
        <TrendingUpIcon sx={{ fontSize: 18, mr: 1 }} />
        <strong>Omsætning/Index:</strong> <span>{omsaetning}</span>{" "}
        <span style={{ color: getColor(indexVal) }}>/ {index}</span>
      </Typography>

      <Typography>
        <ShoppingCartIcon sx={{ fontSize: 18, mr: 1 }} />
        <strong>Eksp:</strong>{" "}
        <span style={{ color: getColor(ekspVal) }}>{eksp}</span>
      </Typography>

      <Typography>
        <AttachMoneyIcon sx={{ fontSize: 18, mr: 1 }} />
        <strong>Gns. køb:</strong>{" "}
        <span style={{ color: getColor(gnsKoebVal) }}>{gnsKoeb}</span>
      </Typography>
    </Box>
  );
};

export default DepartmentCard;
