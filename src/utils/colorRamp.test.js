import { describe, it, expect } from "vitest";
import { hexRgb, lerpN, obColor } from "./colorRamp";

describe("colorRamp utils", () => {
  it("hexRgb correctly converts hex to rgb array", () => {
    expect(hexRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(hexRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexRgb("#ff0000")).toEqual([255, 0, 0]);
    expect(hexRgb("#abc")).toEqual([170, 187, 204]); // #aabbcc
  });

  it("lerpN interpolates correctly", () => {
    expect(lerpN(0, 100, 0.5)).toBe(50);
    expect(lerpN(20, 80, 0.25)).toBe(35);
  });

  it("obColor handles null values", () => {
    expect(obColor(null, ["#000", "#fff"], 0, 100)).toBe("#d4d0c8");
    expect(obColor(undefined, ["#000", "#fff"], 0, 100)).toBe("#d4d0c8");
  });

  it("obColor handles equal min/max", () => {
    // Should return the color at 0.5 (middle of the ramp)
    // ramp: "#000", "#fff". middle is ~ rgb(128,128,128)
    const color = obColor(50, ["#000000", "#ffffff"], 50, 50);
    expect(color).toBe("rgb(128,128,128)");
  });

  it("obColor clamps values outside min/max", () => {
    const ramp = ["#000000", "#ffffff"]; // simplify
    // val > max
    expect(obColor(150, ramp, 0, 100)).toBe("rgb(255,255,255)");
    // val < min
    expect(obColor(-50, ramp, 0, 100)).toBe("rgb(0,0,0)");
  });
});
