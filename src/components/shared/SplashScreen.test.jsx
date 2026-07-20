import { describe, it, expect, vi, afterEach } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { SplashScreen } from "./SplashScreen";

describe("SplashScreen", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the SLSH wordmark", () => {
    render(<SplashScreen />);
    expect(screen.getByText("SLSH")).toBeInTheDocument();
  });

  it("calls onComplete and unmounts itself after the hold + fade duration", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<SplashScreen onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2200 + 600);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("SLSH")).not.toBeInTheDocument();
  });
});
