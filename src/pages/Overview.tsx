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
  Grid,
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

// Bruger dette, for at kunne henter alle departments, fra vores department api. Detter gør jeg så jeg kan fetche dem dynamisk, og ikke hardcode noget.
interface Department {
  id: string;
  name: string;
}

// Genanvendelig visnings-komponent til ét nøgletal (fx omsætning, DB, eksp, gns. køb)
const MetricCard = ({
  title,
  value,
  index,
}: {
  title: string;
  value: string;
  index: string;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        padding: { xs: "0.8rem", sm: "1rem" },
        textAlign: "center",
        height: "100%",
      }}
    >
      <Typography
        fontSize={{ xs: "0.85rem", sm: "0.9rem" }}
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography fontWeight="bold" fontSize={{ xs: "1.3rem", sm: "1.5rem" }}>
        {value}
      </Typography>

      <Typography
        fontSize={{ xs: "0.95rem", sm: "1rem" }}
        color="text.secondary"
      >
        {index}
      </Typography>
    </Box>
  );
};

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
  //const [selectedDepartments] = useState<string[]>(["001", "002", "003"]);
  const [triggerFetch, setTriggerFetch] = useState(false);

  // åbner dialog for mobilform perioder
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

  const allSelected = selectedGroups.length === itemGroups.length;

  // Her laver jeg mine Const til interface Department
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const [comparisonData, setComparisonData] = useState<{
    period1Sum: number;
    period2Sum: number;
  } | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [totalSummary, setTotalSummary] = useState<TotalSummary | null>(null);

  // Beregn hvilken periode der er størst (til brug i mobilgraf-farver og rækkefølge)
  const isPeriod1Bigger =
    (comparisonData?.period1Sum ?? 0) > (comparisonData?.period2Sum ?? 0);

  const biggerValue = isPeriod1Bigger
    ? comparisonData?.period1Sum ?? 0
    : comparisonData?.period2Sum ?? 0;

  const smallerValue = isPeriod1Bigger
    ? comparisonData?.period2Sum ?? 0
    : comparisonData?.period1Sum ?? 0;

  const biggerDateLabel = isPeriod1Bigger
    ? startDate?.format("DD/MM/YYYY") ?? ""
    : compareStart?.format("DD/MM/YYYY") ?? "";

  const smallerDateLabel = isPeriod1Bigger
    ? compareStart?.format("DD/MM/YYYY") ?? ""
    : startDate?.format("DD/MM/YYYY") ?? "";

  const barColors = isMobile
    ? ["#0e4d90", "#232323"] // EasyPOS blå og sort
    : undefined;

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

  // Henter afdelinger
  useEffect(() => {
    const fetchDepartments = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) return;

      try {
        const res = await axios.get("/api/masterdata/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const deptList: Department[] = res.data.departments.map((d: any) => ({
          id: d.departmentnumber,
          name: d.name,
        }));

        setDepartments(deptList);
        setSelectedDepartments(deptList.map((d) => d.id)); // Vælg alle som standard
      } catch (err) {
        console.error("Fejl ved hentning af afdelinger", err);
      }
    };

    fetchDepartments();
  }, []);

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

  // Her fetcher jeg Departments

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
          backgroundColor: theme.palette.grey[100],
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* EasyPOS logo øverst */}
        <Box sx={{ textAlign: isMobile ? "center" : "left", mb: 2 }}>
          <img
            src="/EasyPOS%20LOGO_horisontal%201_blue.png"
            alt="EasyPOS Logo"
            style={{
              maxWidth: "100%",
              height: isMobile ? "40px" : "60px",
              objectFit: "contain",
            }}
          />
        </Box>

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
        {!isMobile && (
          <>
            <Typography fontWeight="medium" sx={{ mb: 1 }}>
              Periode
            </Typography>
            <Stack direction="row" spacing={2} mb={3}>
              <DatePicker
                label="Fra dato"
                value={startDate}
                onChange={setStartDate}
                format="DD-MM-YYYY"
              />
              <DatePicker
                label="Til dato"
                value={endDate}
                onChange={setEndDate}
                format="DD-MM-YYYY"
              />
            </Stack>

            <Typography fontWeight="medium" sx={{ mb: 1 }}>
              Sammenlign
            </Typography>
            <Stack direction="row" spacing={2} mb={3}>
              <DatePicker
                label="Fra dato"
                value={compareStart}
                onChange={setCompareStart}
                format="DD-MM-YYYY"
              />
              <DatePicker
                label="Til dato"
                value={compareEnd}
                onChange={setCompareEnd}
                format="DD-MM-YYYY"
              />
            </Stack>
          </>
        )}

        {/* Handlingsknapper: opdater data og vælg varegrupper */}
        {/* Knapper – tilpasses baseret på isMobile */}
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          mt={2}
          justifyContent={isMobile ? "center" : "flex-start"}
        >
          {isMobile ? (
            // Mobilform: "Vælg perioder" åbner en dialog
            <Button
              variant="contained"
              onClick={() => setIsDateDialogOpen(true)}
            >
              VÆLG PERIODER
            </Button>
          ) : (
            // PC-form: "Opdater" henter data
            <Button variant="contained" onClick={fetchComparison}>
              OPDATER
            </Button>
          )}

          {/* Vælg varegrupper vises i begge tilfælde */}
          <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
            VÆLG VAREGRUPPER
          </Button>
        </Box>

        {/* Totalbox - viser nøgletal for perioden og index sammenlignet med sidste år */}

        {totalSummary ? (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={8}>
              {/* Hver Grid item tilpasses skærmstørrelsen:
          - xs=6 (50%) → 2 kort pr. række på mobil
          - md=3 (25%) → 4 kort pr. række på større skærme
      */}
              <Grid item xs={6} sm={6} md={6}>
                <MetricCard
                  title="Omsætning/Index"
                  value={totalSummary.oms.toLocaleString("da-DK", {
                    style: "currency",
                    currency: "DKK",
                  })}
                  index={`${totalSummary.omsIdx.toFixed(2)}%`}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <MetricCard
                  title="DB/DG"
                  value={totalSummary.db.toLocaleString("da-DK", {
                    style: "currency",
                    currency: "DKK",
                  })}
                  index={`${totalSummary.dg.toFixed(2)}%`}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <MetricCard
                  title="Eksp/Index"
                  value={`${totalSummary.eksp.toLocaleString("da-DK")} stk`}
                  index={`${totalSummary.ekspIdx.toFixed(2)}%`}
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6}>
                <MetricCard
                  title="Gns. køb/Index"
                  value={totalSummary.gnsKob.toLocaleString("da-DK", {
                    style: "currency",
                    currency: "DKK",
                  })}
                  index={`${totalSummary.gnsKobIdx.toFixed(2)}%`}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Typography mt={4}>Ingen data endnu</Typography>
        )}

        {/* Graf med sammenlignende omsætning */}
        {comparisonData &&
          comparisonData.period1Sum != null &&
          comparisonData.period2Sum != null && (
            <>
              <Box
                sx={{ maxWidth: isMobile ? "100%" : 700, mx: "auto", mt: 4 }}
              >
                <SalesChart
                  labels={
                    isMobile
                      ? [smallerDateLabel, biggerDateLabel] // Skift rækkefølgen her
                      : [
                          startDate?.format("DD/MM/YYYY") ?? "",
                          compareStart?.format("DD/MM/YYYY") ?? "",
                        ]
                  }
                  values={
                    isMobile
                      ? [smallerValue, biggerValue] // Skift rækkefølgen her
                      : [comparisonData.period1Sum, comparisonData.period2Sum]
                  }
                  colors={isMobile ? ["#0e4d90", "#232323"] : undefined} // Blå = venstre = 2025
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

      {/* Mobilvisning: Periode-dialog med 4 datepickers */}
      {isMobile && (
        <Dialog
          open={isDateDialogOpen}
          onClose={() => setIsDateDialogOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: { borderRadius: 2, p: 2 },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
            Vælg Perioder
          </DialogTitle>

          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Periode 1 */}
            <Typography variant="subtitle2">Periode</Typography>
            <DatePicker
              label="Fra dato"
              value={startDate}
              onChange={setStartDate}
              format="DD-MM-YYYY"
            />
            <DatePicker
              label="Til dato"
              value={endDate}
              onChange={setEndDate}
              format="DD-MM-YYYY"
            />

            {/* Periode 2 */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Sammenlign
            </Typography>
            <DatePicker
              label="Fra dato"
              value={compareStart}
              onChange={setCompareStart}
              format="DD-MM-YYYY"
            />
            <DatePicker
              label="Til dato"
              value={compareEnd}
              onChange={setCompareEnd}
              format="DD-MM-YYYY"
            />
          </DialogContent>

          <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
            <Button onClick={() => setIsDateDialogOpen(false)} color="inherit">
              Annuller
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsDateDialogOpen(false);
                setTriggerFetch(true); // start fetch
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </LocalizationProvider>
  );
};

export default Overview;
