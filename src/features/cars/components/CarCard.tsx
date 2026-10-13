import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Car } from "../types/types";

type Props = {
  vehicle: Car;
};

export function CarCard({ vehicle }: Props) {
  return (
    <Card
      component="li"
      variant="outlined"
      sx={{ listStyle: "none", height: "100%", overflow: "hidden " }}
    >
      <Box
        component="picture"
        sx={{
          display: "block",
          width: "100%",
          aspectRatio: { xs: "16 / 10", md: "16 / 9" },
        }}
      >
        <source media="(max-width: 639px)" srcSet={vehicle.mobile} />
        <source
          media="(min-width: 640px) and (max-width: 1023px)"
          srcSet={vehicle.tablet}
        />
        <Box
          component="img"
          src={vehicle.desktop}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <CardContent>
        <Stack spacing={0.5}>
          <Typography component="h3" variant="h6" fontWeight={700}>
            {vehicle.make} {vehicle.model}
          </Typography>

          <Typography color="text.secondary" variant="body2">
            {vehicle.year} {vehicle.color}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
