import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import PublicIcon from "@mui/icons-material/Public";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import DepartmentCard from "../components/DepartmentCard";
import SalesChart from "../components/SalesChart";
import axios from "axios";
import {
  calculateTotal,
  PeriodData,
  TotalSummary,
} from "../utils/calculateTotal"; // min calculate

interface ItemGroup {
  id: string;
  name: string;
  shortkey: string;
}

const Overview = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(1, "day"));
  const [compareStart, setCompareStart] = useState<Dayjs | null>(
    dayjs().subtract(1, "year")
  );
  const [compareEnd, setCompareEnd] = useState<Dayjs | null>(
    dayjs().subtract(1, "year").add(1, "day")
  );

  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedDepartments] = useState<string[]>(["001", "002", "003"]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const allSelected = selectedGroups.length === itemGroups.length;

  const [comparisonData, setComparisonData] = useState<{
    period1Sum: number;
    period2Sum: number;
  } | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [totalSummary, setTotalSummary] = useState<TotalSummary | null>(null);

  // Når triggerFetch er sat til true (efter tryk på "OK" i dialogen),
  // og alle datoer er sat, så kaldes fetchComparison.
  // Vi fjerner selectedGroups.length > 0 for at understøtte "vis alt" hvis ingen er valgt.
  useEffect(() => {
    if (triggerFetch && startDate && endDate && compareStart && compareEnd) {
      fetchComparison();
      setTriggerFetch(false); // reset flag efter kald
    }
  }, [
    triggerFetch,
    selectedGroups,
    startDate,
    endDate,
    compareStart,
    compareEnd,
  ]);

  useEffect(() => {
    const fetchItemGroups = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) return console.error("No auth token");

      try {
        const response = await axios.get("/api/masterdata/itemgroups", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fullGroups = response.data.itemgroups
          .map((g: any) => ({
            id: `${g.name}-${g.shortkey}`,
            name: g.name ?? "Ukendt",
            shortkey: g.shortkey ?? "",
          }))
          .filter(
            (g: ItemGroup) => g.shortkey !== undefined && g.shortkey !== ""
          );

        setItemGroups(fullGroups);
      } catch (err) {
        console.error("Fejl ved hentning af varegrupper:", err);
      }
    };

    fetchItemGroups();
  }, []);

  // her starter min fetch på data, i forhold til om jeg tager varegrupper med også i mit API
  const fetchComparison = async () => {
    // Hent JWT token fra localStorage eller sessionStorage
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) return console.error("Auth token missing");

    // Sikr dig at alle datoer er valgt før du fortsætter
    if (!startDate || !endDate || !compareStart || !compareEnd) {
      alert("Alle datoer skal være udfyldt.");
      return;
    }

    // Find alle shortkeys fra alle tilgængelige varegrupper
    const allShortkeys = itemGroups.map((g) => g.shortkey).filter((key) => key);

    // Find shortkeys for de varegrupper brugeren har valgt (via checkboxe)
    const selectedShortkeys = itemGroups
      .filter((g) => selectedGroups.includes(g.id))
      .map((g) => g.shortkey)
      .filter((key) => key); // fjern tomme shortkeys

    // Byg request-body med datoer og afdelinger
    const body: any = {
      datefromperiod1: startDate.startOf("day").toISOString(),
      datetoperiod1: endDate.endOf("day").toISOString(),
      datefromperiod2: compareStart.startOf("day").toISOString(),
      datetoperiod2: compareEnd.endOf("day").toISOString(),
      departments: selectedDepartments,
    };

    // 👇 Dette er den vigtige del:
    // Hvis brugeren har valgt NOGLE varegrupper, men IKKE ALLE → så medsend itemgroups
    // Hvis INGEN eller ALLE er valgt → så medsend IKKE itemgroups, så API’en henter alt
    const isAllSelected =
      selectedShortkeys.length > 0 &&
      selectedShortkeys.length === allShortkeys.length;

    if (selectedShortkeys.length > 0 && !isAllSelected) {
      body.itemgroups = selectedShortkeys;
    }

    console.log("Final request body:", body); // Til debugging

    try {
      // Send request til API
      const response = await axios.post("/api/statistic/periodsummary", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respons fra API: ", response.data);

      // Find periodedata fra respons
      const periods = response.data.periodsummary?.periods || [];
      const period1 = periods.find((p: any) =>
        p.period?.toLowerCase().includes("1")
      );
      const period2 = periods.find((p: any) =>
        p.period?.toLowerCase().includes("2")
      );

      if (!period1 || !period2) {
        console.warn("Kunne ikke finde begge perioder");
        return;
      }

      // Gem data til brug i graf
      setComparisonData({
        period1Sum: period1.sales_price ?? 0,
        period2Sum: period2.sales_price ?? 0,
      });

      // Gem hele API-responsen til videre brug (fx i afdelingskort)
      setResponseData(response.data);

      // Forbered datagrundlag til beregning af totalboksen
      const period1Data: PeriodData = {
        oms: period1.sales_price ?? 0,
        kostpr: period1.cost_price ?? 0,
        moms: period1.vat ?? 0,
        eksp: period1.number_of_sales ?? 0,
      };

      const period2Data: PeriodData = {
        oms: period2.sales_price ?? 0,
        kostpr: period2.cost_price ?? 0,
        moms: period2.vat ?? 0,
        eksp: period2.number_of_sales ?? 0,
      };

      // Beregn totals og indeks, og gem det i state
      const totals = calculateTotal(period1Data, period2Data);
      setTotalSummary(totals);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
    }
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(itemGroups.map((g) => g.id));
    }
  };

  return (
    // Giver kontekst til alle dato-pickers og sikrer korrekt Dayjs-integration
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Ydre container med padding og baggrund afhængig af skærmstørrelse */}
      <Box
        sx={{
          p: isMobile ? 2 : 4,
          backgroundColor: isMobile ? theme.palette.grey[100] : "transparent",
        }}
      >
        {/* Sideoverskrift */}
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign={isMobile ? "center" : "left"}
        >
          Overblik
        </Typography>

        {/* Periodevalg */}
        <Typography fontWeight="medium" sx={{ mb: 1 }}>
          Periode
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} mb={3}>
          <DatePicker
            label="Fra dato"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker label="Til dato" value={endDate} onChange={setEndDate} />
        </Stack>

        {/* Sammenligningsperiode */}
        <Typography fontWeight="medium" sx={{ mb: 1 }}>
          Sammenlign
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} mb={3}>
          <DatePicker
            label="Fra dato"
            value={compareStart}
            onChange={setCompareStart}
          />
          <DatePicker
            label="Til dato"
            value={compareEnd}
            onChange={setCompareEnd}
          />
        </Stack>

        {/* Handlingsknapper: opdater data og vælg varegrupper */}
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          mt={2}
        >
          <Button variant="contained" onClick={fetchComparison}>
            Opdater
          </Button>
          <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
            Vælg Varegrupper
          </Button>
        </Box>

        {/* Totalbox - viser nøgletal for perioden og index sammenlignet med sidste år */}

        <Box
          sx={{
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            p: 3,
            maxWidth: isMobile ? "100%" : 360,
            mt: 4,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Total
          </Typography>
          <Stack spacing={1}>
            {totalSummary ? (
              <>
                {/* Omsætning og index */}
                <Box display="flex" alignItems="center" gap={1}>
                  <PublicIcon fontSize="small" />
                  <Typography fontWeight="bold">Omsætning/Index:</Typography>
                  <Typography>
                    {totalSummary.oms.toLocaleString("da-DK", {
                      style: "currency",
                      currency: "DKK",
                    })}{" "}
                    / {totalSummary.omsIdx > 0 ? "+" : ""}
                    {totalSummary.omsIdx.toFixed(2)}%
                  </Typography>
                </Box>

                {/* Dækningsbidrag og dækningsgrad */}
                <Box display="flex" alignItems="center" gap={1}>
                  <LocalOfferIcon fontSize="small" />
                  <Typography fontWeight="bold">DB/DG:</Typography>
                  <Typography>
                    {totalSummary.db.toLocaleString("da-DK", {
                      style: "currency",
                      currency: "DKK",
                    })}{" "}
                    / {totalSummary.dg.toFixed(2)}%
                  </Typography>
                </Box>

                {/* Antal ekspeditioner og index */}
                <Box display="flex" alignItems="center" gap={1}>
                  <ShoppingCartIcon fontSize="small" />
                  <Typography fontWeight="bold">Eksp/Index:</Typography>
                  <Typography>
                    {totalSummary.eksp.toLocaleString("da-DK")} stk /{" "}
                    {totalSummary.ekspIdx > 0 ? "+" : ""}
                    {totalSummary.ekspIdx.toFixed(2)}%
                  </Typography>
                </Box>

                {/* Gennemsnitskøb og index */}
                <Box display="flex" alignItems="center" gap={1}>
                  <ShoppingBasketIcon fontSize="small" />
                  <Typography fontWeight="bold">Gns. køb/Index:</Typography>
                  <Typography>
                    {totalSummary.gnsKob.toLocaleString("da-DK", {
                      style: "currency",
                      currency: "DKK",
                    })}{" "}
                    / {totalSummary.gnsKobIdx > 0 ? "+" : ""}
                    {totalSummary.gnsKobIdx.toFixed(2)}%
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography>Ingen data endnu</Typography>
            )}
          </Stack>
        </Box>

        {/* Graf med sammenlignende omsætning */}
        {comparisonData &&
          comparisonData.period1Sum != null &&
          comparisonData.period2Sum != null && (
            <>
              <Box
                sx={{ maxWidth: isMobile ? "100%" : 700, mx: "auto", mt: 4 }}
              >
                <SalesChart
                  labels={[
                    startDate?.format("DD/MM/YYYY") ?? "",
                    compareStart?.format("DD/MM/YYYY") ?? "",
                  ]}
                  values={[
                    comparisonData.period1Sum,
                    comparisonData.period2Sum,
                  ]}
                />
              </Box>
              <Divider sx={{ my: 4 }} />
            </>
          )}
        {/* Afdelingskort med individuelle nøgletal */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Afdelinger
        </Typography>
        <Stack spacing={2}>
          {responseData?.periodsummary?.departments?.map((dept: any) => {
            const omsaetning = dept.sales_price ?? 0;
            const eksp = dept.number_of_sales ?? 0;
            const gnsKoeb = eksp > 0 ? omsaetning / eksp : 0;

            const omsIdx = totalSummary?.oms
              ? (omsaetning / totalSummary.oms) * 100
              : 0;

            const ekspIdx = totalSummary?.eksp
              ? (eksp / totalSummary.eksp) * 100
              : 0;

            const gnsKoebIdx = totalSummary?.gnsKob
              ? (gnsKoeb / totalSummary.gnsKob) * 100
              : 0;

            return (
              <DepartmentCard
                key={dept.department}
                name={`${dept.name} (${dept.department})`}
                omsaetning={`${omsaetning.toLocaleString("da-DK", {
                  style: "currency",
                  currency: "DKK",
                })}`}
                index={`${omsIdx.toFixed(2)} %`}
                eksp={`${eksp} stk / ${ekspIdx.toFixed(2)} %`}
                gnsKoeb={`${gnsKoeb.toLocaleString("da-DK", {
                  style: "currency",
                  currency: "DKK",
                })} / ${gnsKoebIdx.toFixed(2)} %`}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Varegruppe-dialog med checkboxe og vælg alle/fravælg alle */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: "#2c2c2c", color: "#fff", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Vælg Varegrupper
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 300 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color={allSelected ? "secondary" : "primary"}
              sx={{ alignSelf: "flex-start", mb: 2 }}
              onClick={handleToggleAll}
            >
              {allSelected ? "Fravælg alle" : "Vælg alle"}
            </Button>
            {itemGroups.length === 0 ? (
              <Typography>Ingen varegrupper fundet.</Typography>
            ) : (
              itemGroups.map((group) => (
                <FormControlLabel
                  key={group.id}
                  control={
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleToggleGroup(group.id)}
                      sx={{
                        color: "white",
                        "&.Mui-checked": { color: "#2196f3" },
                      }}
                    />
                  }
                  label={group.name}
                />
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            sx={{ color: "#90caf9" }}
          >
            Annuller
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsDialogOpen(false);
              setTriggerFetch(true);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default Overview;
