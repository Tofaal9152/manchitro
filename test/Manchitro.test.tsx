import * as React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Manchitro, type ValidDistrict } from "../src";

afterEach(cleanup);

const button = (name: string) => screen.getByRole("button", { name });

describe("Manchitro", () => {
  it("renders all 64 districts without items", () => {
    const { container } = render(<Manchitro />);
    expect(container.querySelectorAll("path")).toHaveLength(64);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("accepts objects, plain strings and alternate spellings", () => {
    render(
      <Manchitro items={[{ place: "dhaka" }, "Chattogram", { id: 3, place: "cumilla", count: 9 }]} />,
    );
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label")).sort()).toEqual([
      "Chittagong",
      "Comilla",
      "Dhaka",
    ]);
  });

  it("uncontrolled: selects the first item, then the clicked one", () => {
    const onSelect = vi.fn();
    render(<Manchitro items={["Dhaka", "Sylhet"]} onSelect={onSelect} />);
    expect(button("Dhaka").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button("Sylhet"));
    expect(onSelect).toHaveBeenCalledWith("Sylhet");
    expect(button("Sylhet").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Selected: Sylhet")).toBeTruthy();
  });

  it("uncontrolled: honors and normalizes defaultValue", () => {
    render(<Manchitro items={["Dhaka", "Sylhet"]} defaultValue="SYLHET" />);
    expect(button("Sylhet").getAttribute("aria-pressed")).toBe("true");
  });

  it("controlled: follows value and normalizes it", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <Manchitro items={["Dhaka", "Sylhet"]} value="dhaka" onSelect={onSelect} />,
    );
    expect(button("Dhaka").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button("Sylhet"));
    expect(onSelect).toHaveBeenCalledWith("Sylhet");
    // Parent didn't update value, so selection stays
    expect(button("Dhaka").getAttribute("aria-pressed")).toBe("true");
    rerender(<Manchitro items={["Dhaka", "Sylhet"]} value={null} />);
    expect(screen.queryByText(/^Selected:/)).toBeNull();
  });

  it("controlled: works with useState<ValidDistrict | null> setter", () => {
    function App() {
      const [v, setV] = React.useState<ValidDistrict | null>(null);
      return <Manchitro items={["Dhaka", "Khulna"]} value={v} onSelect={setV} />;
    }
    render(<App />);
    fireEvent.click(button("Khulna"));
    expect(button("Khulna").getAttribute("aria-pressed")).toBe("true");
  });

  it("supports keyboard selection", () => {
    const onSelect = vi.fn();
    render(<Manchitro items={["Dhaka", "Sylhet"]} onSelect={onSelect} />);
    fireEvent.keyDown(button("Sylhet"), { key: "Enter" });
    fireEvent.keyDown(button("Dhaka"), { key: " " });
    expect(onSelect.mock.calls).toEqual([["Sylhet"], ["Dhaka"]]);
  });

  it("ignores clicks and hovers on districts not in items", () => {
    const onSelect = vi.fn();
    const onEnter = vi.fn();
    render(<Manchitro items={["Dhaka"]} onSelect={onSelect} onDistrictMouseEnter={onEnter} />);
    const khulna = screen.getByRole("img", { name: "Khulna" });
    fireEvent.click(khulna);
    fireEvent.mouseEnter(khulna);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
    fireEvent.mouseEnter(button("Dhaka"));
    expect(onEnter).toHaveBeenCalledWith("Dhaka", expect.anything());
  });

  it("disabled: no buttons, no callbacks", () => {
    const onSelect = vi.fn();
    const onEnter = vi.fn();
    render(<Manchitro items={["Dhaka"]} disabled onSelect={onSelect} onDistrictMouseEnter={onEnter} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    const dhaka = screen.getByRole("img", { name: "Dhaka" });
    fireEvent.click(dhaka);
    fireEvent.mouseEnter(dhaka);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("reports unknown places once, even with inline props that set state", () => {
    const onDebug = vi.fn();
    function App() {
      const [, setInfo] = React.useState<object | null>(null);
      return (
        <Manchitro
          items={[{ place: "Dhaka" }, { place: "Atlantis" }]}
          onDebug={(info) => {
            onDebug(info);
            setInfo(info);
          }}
        />
      );
    }
    render(<App />);
    expect(onDebug).toHaveBeenCalledTimes(1);
    expect(onDebug).toHaveBeenCalledWith({ unknownPlaces: ["Atlantis"], activeDistricts: ["Dhaka"] });
    expect(screen.getByText("Atlantis")).toBeTruthy();
  });

  it("render props replace or hide the overlays", () => {
    render(
      <Manchitro
        items={["Dhaka", "Nowhere"]}
        renderSelected={(d) => <p>Custom {d}</p>}
        renderDebug={() => null}
      />,
    );
    expect(screen.getByText("Custom Dhaka")).toBeTruthy();
    expect(screen.queryByText(/Unknown places/)).toBeNull();
  });

  it("keeps the container positioned when className is set", () => {
    const { container } = render(<Manchitro className="my-map" style={{ padding: 8 }} />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toBe("my-map");
    expect(div.style.position).toBe("relative");
    expect(div.style.padding).toBe("8px");
  });

  it("uses the custom selected color for the glow", () => {
    const { container } = render(<Manchitro items={["Dhaka"]} colors={{ selected: "#ef4444" }} />);
    const html = container.innerHTML;
    expect(html).toContain("#ef4444");
    expect(html).not.toContain("34,197,94");
  });

  it("server-renders the same selection as the client", () => {
    const html = renderToString(<Manchitro items={["Sylhet"]} />);
    expect(html).toContain("Selected: <!-- -->Sylhet");
  });

  it("updates selection when items change", () => {
    const { rerender } = render(<Manchitro items={["Dhaka"]} />);
    act(() => rerender(<Manchitro items={["Khulna"]} />));
    expect(button("Khulna").getAttribute("aria-pressed")).toBe("true");
  });
});
