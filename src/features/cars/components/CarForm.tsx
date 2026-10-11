import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { CreateCarInput, CreateCarResult } from "../types/types";
import { CarFormInput } from "./CarFormInput";
import { ChangeEvent, FormEvent, useState } from "react";

type Props = {
  onCreate: (input: CreateCarInput) => Promise<CreateCarResult>;
  disabled: boolean;
  isCreating: boolean;
};

type FormValues = {
  make: string;
  model: string;
  year: string;
  color: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const DEFAULT_FORM: FormValues = {
  make: "",
  model: "",
  year: "",
  color: "",
};

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear() + 1;

export function CarForm({ onCreate, disabled, isCreating }: Props) {
  const [values, setValues] = useState<FormValues>(DEFAULT_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      setFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));

      setApiError(null);
      setSuccessMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setApiError(null);
    setSuccessMessage(null);

    const year = Number(values.year);
    const nextErrors: FieldErrors = {};

    if (!values.make.trim()) {
      nextErrors.make = "Enter a make";
    }

    if (!values.model.trim()) {
      nextErrors.model = "Enter a model";
    }

    if (
      !values.year.trim() ||
      !Number.isInteger(year) ||
      year < MIN_YEAR ||
      year > MAX_YEAR
    ) {
      nextErrors.year = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}`;
    }

    if (!values.color.trim()) {
      nextErrors.color = "Enter a color";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result = await onCreate({
      make: values.make.trim(),
      model: values.model.trim(),
      year,
      color: values.color.trim(),
    });

    if (!result.ok) {
      if (result.kind === "validation") {
        setFieldErrors({
          make: "Check the make field",
          model: "Check the model field",
        });
      }

      setApiError(result.message);
      return;
    }

    setValues(DEFAULT_FORM);
    setFieldErrors({});

    setSuccessMessage(
      `${result.car.make} ${result.car.model} add to inventory!`,
    );
  };

  return (
    <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography component="h2" variant="h5" fontWeight={700}>
            Add a vehicle
          </Typography>

          <Typography color="text.secondary" variant="body2">
            Enter the vehicle details to add it to the inventory
          </Typography>
        </Box>

        {apiError && (
          <Alert severity="error" role="alert">
            {apiError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" role="status">
            {successMessage}
          </Alert>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <CarFormInput
              id="car-make"
              label="Make"
              name="make"
              value={values.make}
              onChange={handleChange("make")}
              error={fieldErrors.make}
              disabled={disabled}
            />
            <CarFormInput
              id="car-model"
              label="Model"
              name="model"
              value={values.model}
              onChange={handleChange("model")}
              error={fieldErrors.model}
              disabled={disabled}
            />
            <CarFormInput
              id="car-year"
              label="Year"
              name="year"
              value={values.year}
              onChange={handleChange("year")}
              error={fieldErrors.year}
              disabled={disabled}
            />
            <CarFormInput
              id="car-color"
              label="Color"
              name="color"
              value={values.color}
              onChange={handleChange("color")}
              error={fieldErrors.color}
              disabled={disabled}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={disabled || isCreating}
              fullWidth
            >
              {isCreating ? "Adding vehicle..." : "Add vehicle"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
