import { ApolloError, useMutation, useQuery } from "@apollo/client";
import {
  CreateCarInput,
  CreateCarMutation,
  CreateCarMutationVariables,
  CreateCarResult,
  GetCarsQuery,
  CarSortOrder,
} from "../types/types";
import { CREATE_CAR, GET_CARS } from "../api/operations";
import { useCallback, useMemo } from "react";

const DEFAULT_IMAGES = {
  mobile: "/images/default-mobile.svg",
  tablet: "/images/default-tablet.svg",
  desktop: "/images/default-desktop.svg",
};

type UseCarsOptions = {
  searchTerm: string;
  sortOrder: CarSortOrder;
  onMutationError?: (error: unknown) => void;
};

function isBadUserInput(error: unknown): boolean {
  return (
    error instanceof ApolloError &&
    error.graphQLErrors.some(
      (graphQLError) => graphQLError.extensions?.code === "BAD_USER_INPUT",
    )
  );
}

export function useCars({
  searchTerm,
  sortOrder,
  onMutationError,
}: UseCarsOptions) {
  const { data, loading, error, refetch } = useQuery<GetCarsQuery>(GET_CARS, {
    notifyOnNetworkStatusChange: true,
  });

  const [runCreateCar, { loading: isCreating }] = useMutation<
    CreateCarMutation,
    CreateCarMutationVariables
  >(CREATE_CAR, {
    update(cache, { data: mutationData }) {
      const createdCar = mutationData?.createCar;
      if (!createdCar) return;

      cache.updateQuery<GetCarsQuery>({ query: GET_CARS }, (current) => {
        if (!current) return current;

        if (current.cars.some((car) => car.id === createdCar.id)) {
          return current;
        }

        return { cars: [...current.cars, createdCar] };
      });
    },
  });

  const allCars = useMemo(() => data?.cars ?? [], [data?.cars]);

  const visibleCars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

    const filtered = allCars.filter((car) =>
      car.model.toLocaleLowerCase().includes(normalizedSearch),
    );

    return filtered.sort((first, second) => {
      if (sortOrder === "year-desc") {
        return second.year - first.year;
      }

      return first.model.localeCompare(second.model);
    });
  }, [allCars, searchTerm, sortOrder]);

  const createCar = useCallback(
    async (input: CreateCarInput): Promise<CreateCarResult> => {
      const normalizedInput: CreateCarInput = {
        ...input,
        make: input.make.trim(),
        model: input.model.trim(),
        color: input.color.trim(),

        mobile: input.mobile?.trim() || DEFAULT_IMAGES.mobile,
        tablet: input.tablet?.trim() || DEFAULT_IMAGES.tablet,
        desktop: input.desktop?.trim() || DEFAULT_IMAGES.desktop,
      };

      try {
        const response = await runCreateCar({
          variables: { input: normalizedInput },
        });

        const car = response.data?.createCar;

        if (!car) {
          return {
            ok: false,
            kind: "unknown",
            message: "The car could not be saved. Please try again.",
          };
        }

        return {
          ok: true,
          car,
        };
      } catch (error: unknown) {
        if (isBadUserInput(error)) {
          return {
            ok: false,
            kind: "validation",
            message:
              "The API rejected the make or model. Check both field and try again.",
          };
        }

        onMutationError?.(error);

        return {
          ok: false,
          kind: "unknown",
          message: "The car could not be saved. Please try again.",
        };
      }
    },
    [runCreateCar, onMutationError],
  );

  return {
    allCars,
    visibleCars,
    loading,
    error,
    refetch,
    createCar,
    isCreating,
  };
}
