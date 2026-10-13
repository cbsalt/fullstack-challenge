import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { useCars } from "@/features/cars/hooks/useCars";
import { CREATE_CAR, GET_CARS } from "@/features/cars/api/operations";
import {
  CarSortOrder,
  CreateCarInput,
  CreateCarMutationVariables,
} from "@/features/cars/types/types";

const cars = [
  {
    __typename: "Car",
    id: "1",
    make: "Audi",
    model: "Q5",
    year: 2022,
    color: "Black",
    mobile: "/images/q3-mobile.svg",
    tablet: "/images/q3-tablet.svg",
    desktop: "/images/q3-desktop.svg",
  },
  {
    __typename: "Car",
    id: "2",
    make: "Tesla",
    model: "Model Y",
    year: 2024,
    color: "White",
    mobile: "/images/q3-mobile.svg",
    tablet: "/images/q3-tablet.svg",
    desktop: "/images/q3-desktop.svg",
  },
  {
    __typename: "Car",
    id: "3",
    make: "Audi",
    model: "e-tron GT",
    year: 2023,
    color: "Gray",
    mobile: "/images/q3-mobile.svg",
    tablet: "/images/q3-tablet.svg",
    desktop: "/images/q3-desktop.svg",
  },
];

const createdCar = {
  ...cars[0],
  id: "4",
  model: "A6",
  year: 2025,
  color: "Silver",
  mobile: "/images/default-mobile.svg",
  tablet: "/images/default-tablet.svg",
  desktop: "/images/default-desktop.svg",
  __typename: "Car",
};

const createInput: CreateCarInput = {
  make: "Audi",
  model: "A6",
  year: 2025,
  color: "Silver",
};

const getCarsMock = {
  request: { query: GET_CARS },
  result: { data: { cars } },
};

const normalizedCreateInput: CreateCarMutationVariables["input"] = {
  ...createInput,
  make: "Audi",
  model: "A6",
  color: "Silver",
  mobile: "/images/default-mobile.svg",
  tablet: "/images/default-tablet.svg",
  desktop: "/images/default-desktop.svg",
};

function createWrapper(mocks: MockedResponse[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename>
        {children}
      </MockedProvider>
    );
  };
}

const defaultOptions = {
  searchTerm: "",
  sortOrder: "model-asc" as CarSortOrder,
};

describe("useCars", () => {
  it("fetches cars and exposes the loading state", async () => {
    const { result } = renderHook(() => useCars(defaultOptions), {
      wrapper: createWrapper([getCarsMock]),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.allCars).toHaveLength(3);
    expect(result.current.visibleCars).toHaveLength(3);
    expect(result.current.isCreating).toBe(false);
  });

  it("filters cars by model, ignoring case and surrounding whitespace", async () => {
    const { result, rerender } = renderHook((options) => useCars(options), {
      initialProps: {
        searchTerm: "  q5  ",
        sortOrder: "model-asc" as CarSortOrder,
      },
      wrapper: createWrapper([getCarsMock]),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    expect(result.current.visibleCars.map((car) => car.model)).toEqual(["Q5"]);

    rerender({
      searchTerm: "does not exist",
      sortOrder: "model-asc",
    });

    expect(result.current.visibleCars).toEqual([]);
    expect(result.current.allCars).toHaveLength(3);
  });

  it("sorts cars alphabetically by model by default", async () => {
    const { result } = renderHook(() => useCars(defaultOptions), {
      wrapper: createWrapper([getCarsMock]),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    expect(result.current.visibleCars.map((car) => car.model)).toEqual([
      "e-tron GT",
      "Model Y",
      "Q5",
    ]);
  });

  it("sorts cars by year, newest first", async () => {
    const { result, rerender } = renderHook((options) => useCars(options), {
      initialProps: {
        searchTerm: "",
        sortOrder: "year-desc" as CarSortOrder,
      },
      wrapper: createWrapper([getCarsMock]),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    expect(result.current.visibleCars.map((car) => car.year)).toEqual([
      2024, 2023, 2022,
    ]);

    rerender({
      searchTerm: "",
      sortOrder: "model-asc",
    });

    expect(result.current.visibleCars.map((car) => car.model)).toEqual([
      "e-tron GT",
      "Model Y",
      "Q5",
    ]);
  });

  it("creates a car, trims input values, and updates the cached list", async () => {
    const mocks = [
      getCarsMock,
      {
        request: {
          query: CREATE_CAR,
          variables: {
            input: normalizedCreateInput,
          },
        },
        result: {
          data: { createCar: createdCar },
        },
      },
    ];

    const { result } = renderHook(() => useCars(defaultOptions), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    let response: Awaited<ReturnType<typeof result.current.createCar>>;

    await act(async () => {
      response = await result.current.createCar(createInput);
    });

    expect(response!).toEqual({
      ok: true,
      car: createdCar,
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(4);
    });

    expect(result.current.allCars.some((car) => car.id === "4")).toBe(true);
  });

  it("returns a validation result when the API rejects the input", async () => {
    const mocks = [
      getCarsMock,
      {
        request: {
          query: CREATE_CAR,
          variables: {
            input: normalizedCreateInput,
          },
        },
        result: {
          errors: [
            new GraphQLError("Make or model is required", {
              extensions: { code: "BAD_USER_INPUT" },
            }),
          ],
        },
      },
    ];

    const { result } = renderHook(() => useCars(defaultOptions), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    let response;

    await act(async () => {
      response = await result.current.createCar(createInput);
    });

    expect(response).toEqual({
      ok: false,
      kind: "validation",
      message:
        "The API rejected the make or model. Check both field and try again.",
    });

    expect(result.current.allCars).toHaveLength(3);
  });

  it("returns a generic error when the mutation fails unexpectedly", async () => {
    const mocks = [
      getCarsMock,
      {
        request: {
          query: CREATE_CAR,
          variables: {
            input: normalizedCreateInput,
          },
        },
        error: new Error("Network error"),
      },
    ];

    const { result } = renderHook(() => useCars(defaultOptions), {
      wrapper: createWrapper(mocks),
    });

    await waitFor(() => {
      expect(result.current.allCars).toHaveLength(3);
    });

    let response;

    await act(async () => {
      response = await result.current.createCar(createInput);
    });

    expect(response).toEqual({
      ok: false,
      kind: "unknown",
      message: "The car could not be saved. Please try again.",
    });
  });
});
