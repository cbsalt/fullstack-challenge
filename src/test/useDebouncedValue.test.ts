import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("returns the latest value only after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "" } },
    );

    rerender({ value: "F" });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe("");

    rerender({ value: "Fo" });

    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(result.current).toBe("");

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toBe("Fo");
  });
});
