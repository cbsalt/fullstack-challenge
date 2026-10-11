import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarForm } from "@/features/cars/components/CarForm";
import {
  Car,
  CreateCarInput,
  CreateCarResult,
} from "@/features/cars/types/types";

const sampleCar: Car = {
  id: "test-car",
  make: "Volvo",
  model: "XC60",
  year: 2025,
  color: "Silver",
  mobile: "/images/q3-mobile.svg",
  tablet: "/images/q3-tablet.svg",
  desktop: "/images/q3-desktop.svg",
};

describe("CarForm", () => {
  it("shows validation messages and does not submit an empty form", async () => {
    const user = userEvent.setup();

    const onCreate = jest.fn(
      async (_input: CreateCarInput): Promise<CreateCarResult> => ({
        ok: true,
        car: sampleCar,
      }),
    );

    render(<CarForm onCreate={onCreate} disabled={false} isCreating={false} />);

    await user.click(screen.getByRole("button", { name: "Add vehicle" }));

    expect(screen.getByText("Enter a make")).toBeInTheDocument();
    expect(screen.getByText("Enter a model")).toBeInTheDocument();
    expect(screen.getByText(/enter a year between/i)).toBeInTheDocument();
    expect(screen.getByText("Enter a color")).toBeInTheDocument();

    expect(onCreate).not.toHaveBeenCalled();
  });
});
