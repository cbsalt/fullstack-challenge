export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mobile: string;
  tablet: string;
  desktop: string;
};

export type CreateCarInput = Pick<Car, "make" | "model" | "year" | "color"> &
  Partial<Pick<Car, "mobile" | "tablet" | "desktop">>;

export type CarSortOrder = "model-asc" | "year-desc";

export type GetCarsQuery = {
  cars: Car[];
};

export type CreateCarMutation = {
  createCar: Car;
};

export type CreateCarMutationVariables = {
  input: CreateCarInput;
};

export type CreateCarResult =
  | { ok: true; car: Car }
  | {
      ok: false;
      kind: "validation" | "unknown";
      message: string;
    };
