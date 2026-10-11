import { Box } from "@mui/material";
import { Car } from "../types/types";
import { CarCard } from "./CarCard";

type Props = {
  vehicles: Car[];
};

export function CarList({ vehicles }: Props) {
  return (
    <Box
      sx={{
        m: 0,
        p: 0,
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {vehicles.map((vehicle) => (
        <CarCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </Box>
  );
}
