import { graphql, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";

import { apolloClient } from "@/lib/apollo";
import { db } from "@/mocks/db";
import { server } from "@/mocks/server";
import {
  renderWithProviders,
  screen,
  waitFor,
  within,
} from "@/test/renderWithProviders";
import { CarInventoryPage } from "@/features/cars/pages/CarInventoryPage";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(async () => {
  db.reset();
  await apolloClient.clearStore();
});

afterEach(() => {
  server.resetHandlers();
  db.reset();
});

afterAll(() => {
  server.close();
});

describe("Car inventory integration", () => {
  it("loads cars and filters by model", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CarInventoryPage />);

    expect(
      await screen.findByRole("heading", { name: "Audi Q5" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "2023 Audi Q5" }),
    ).toBeInTheDocument();

    const search = screen.getByRole("textbox", {
      name: "Search by model",
    });

    await user.type(search, "Q5");

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Audi R8" }),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "Audi Q5" }),
    ).toBeInTheDocument();
  });

  it("sorts cars by year, newest first", async () => {
    const user = userEvent.setup();

    renderWithProviders(<CarInventoryPage />);

    await screen.findByRole("heading", { name: "Audi Q5" });

    await user.click(screen.getByRole("combobox", { name: "Sort by" }));

    await user.click(
      await screen.findByRole("option", { name: "Year (newest first)" }),
    );

    const inventory = screen.getByRole("list", {
      name: "Vehicle inventory",
    });

    const headings = within(inventory).getAllByRole("heading", {
      level: 3,
    });

    expect(headings[0]).toHaveTextContent("Audi e-tron GT");
  });

  it("creates a car and updates the list without refetching", async () => {
    const user = userEvent.setup();
    let getCarsRequests = 0;

    server.use(
      graphql.query("GetCars", () => {
        getCarsRequests += 1;

        return HttpResponse.json({
          data: { cars: db.list() },
        });
      }),
    );

    renderWithProviders(<CarInventoryPage />);

    await screen.findByRole("heading", { name: "Audi Q5" });

    await user.type(screen.getByRole("textbox", { name: "Make" }), "Ford");
    await user.type(screen.getByRole("textbox", { name: "Model" }), "Mustang");
    await user.type(screen.getByRole("textbox", { name: "Year" }), "2016");
    await user.type(screen.getByRole("textbox", { name: "Color" }), "Black");

    await user.click(screen.getByRole("button", { name: "Add vehicle" }));

    expect(
      await screen.findByRole("heading", { name: "Ford Mustang" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Ford Mustang added to inventory/i),
    ).toBeInTheDocument();

    expect(getCarsRequests).toBe(1);
  });

  it("shows an error when the API rejects the new car", async () => {
    const user = userEvent.setup();

    server.use(
      graphql.mutation("CreateCar", () =>
        HttpResponse.json({
          errors: [
            {
              message: "make and model are required",
              extensions: { code: "BAD_USER_INPUT" },
            },
          ],
        }),
      ),
    );

    renderWithProviders(<CarInventoryPage />);

    await screen.findByRole("heading", { name: "Audi Q5" });

    await user.type(screen.getByRole("textbox", { name: "Make" }), "Ford");
    await user.type(screen.getByRole("textbox", { name: "Model" }), "Mustang");
    await user.type(screen.getByRole("textbox", { name: "Year" }), "2016");
    await user.type(screen.getByRole("textbox", { name: "Color" }), "Black");

    await user.click(screen.getByRole("button", { name: "Add vehicle" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /API rejected the make or model/i,
    );

    expect(screen.getByRole("textbox", { name: "Make" })).toHaveValue("Ford");
  });

  it("shows an empty state when the API returns no cars", async () => {
    server.use(
      graphql.query("GetCars", () =>
        HttpResponse.json({
          data: { cars: [] },
        }),
      ),
    );

    renderWithProviders(<CarInventoryPage />);

    expect(
      await screen.findByText(/no vehicles in the inventory yet/i),
    ).toBeInTheDocument();
  });

  it("shows an error and retry action when the list query fails", async () => {
    server.use(
      graphql.query("GetCars", () =>
        HttpResponse.json({
          errors: [{ message: "service unavailable" }],
        }),
      ),
    );

    renderWithProviders(<CarInventoryPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn't load the vehicle inventory/i,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("shows a loading state while fetching cars", () => {
    renderWithProviders(<CarInventoryPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading vehicles...");
  });
});
