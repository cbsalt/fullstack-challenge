import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useCars } from "../hooks/useCars";
import { CarSortOrder } from "../types/types";
import { CarList } from "../components/CarList";
import { CarForm } from "../components/CarForm";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function CarInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<CarSortOrder>("model-asc");

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const {
    error,
    refetch,
    loading,
    isCreating,
    allCars,
    createCar,
    visibleCars,
  } = useCars({ searchTerm: debouncedSearchTerm, sortOrder });

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as CarSortOrder);
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography component="h1" variant="h3" fontWeight={800}>
              Vehicle inventory
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Browse, search, sort, and add vehicles to the inventory
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <FormControl fullWidth size="small">
                <FormLabel
                  htmlFor="search-model"
                  sx={{ mb: 0.5, color: "text.primary" }}
                >
                  Search by model
                </FormLabel>
                <OutlinedInput
                  id="search-model"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                <FormLabel
                  id="car-sort-label"
                  htmlFor="car-sort"
                  sx={{ mb: 0.5, color: "text.primary" }}
                >
                  Sort by
                </FormLabel>
                <Select
                  labelId="car-sort-label"
                  id="car-sort"
                  value={sortOrder}
                  onChange={handleSortChange}
                >
                  <MenuItem value="model-asc">Model (A-Z)</MenuItem>
                  <MenuItem value="year-desc">Year (newest first)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {loading && (
            <Alert severity="info" role="status">
              Loading vehicles...
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              role="alert"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Retry
                </Button>
              }
            >
              We couldn't load the vehicle inventory. Please try again.
            </Alert>
          )}

          {!loading && !error && allCars.length === 0 && (
            <Alert severity="info">No vehicles in the inventory yet.</Alert>
          )}

          {!loading &&
            !error &&
            allCars.length > 0 &&
            visibleCars.length === 0 && (
              <Alert severity="info">
                No vehicles match "{debouncedSearchTerm}". Try a different model
                search.
              </Alert>
            )}

          {!loading && !error && visibleCars.length > 0 && (
            <Stack spacing={2}>
              <Typography component="h2" variant="h5" fontWeight={700}>
                Cars ({visibleCars.length})
              </Typography>

              <CarList vehicles={visibleCars} />
            </Stack>
          )}

          <CarForm
            onCreate={createCar}
            disabled={loading || Boolean(error)}
            isCreating={isCreating}
          />
        </Stack>
      </Container>
    </Box>
  );
}
