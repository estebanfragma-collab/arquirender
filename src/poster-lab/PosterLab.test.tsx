import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PosterLab from "./PosterLab";
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Local catalog workflow", () => {
  it("shows all 40 choices and filters without changing review decisions", () => {
    render(<PosterLab />);
    expect(
      within(screen.getByRole("region", { name: "Estilos" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(40);
    fireEvent.click(
      screen.getByRole("button", { name: "Productos" }),
    );
    expect(
      within(screen.getByRole("region", { name: "Estilos" })).getAllByRole(
        "button",
      ),
    ).toHaveLength(11);
    expect(screen.getByRole("button", { name: "3 Conservar" }))
      .toBeInTheDocument();
  });
  it("supports text-only styles and persists a review and title across visits", () => {
    render(<PosterLab />);
    fireEvent.click(
      screen.getByRole("button", { name: /Referencia de Minimal diagonal/ }),
    );
    expect(screen.queryByLabelText("Subir fotos")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /^Título/ }), {
      target: { value: "MI EXPOSICIÓN" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Tu decisión" }), {
      target: { value: "adjust" },
    });
    cleanup();
    render(<PosterLab />);
    fireEvent.click(
      screen.getByRole("button", { name: /Referencia de Minimal diagonal/ }),
    );
    expect(screen.getByDisplayValue("MI EXPOSICIÓN")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Tu decisión" })).toHaveValue(
      "adjust",
    );
  });
  it("rejects unsupported images without showing a fake result", () => {
    render(<PosterLab />);
    fireEvent.click(
      screen.getByRole("button", { name: /Referencia de Producto editorial/ }),
    );
    fireEvent.change(screen.getByLabelText("Subir fotos"), {
      target: {
        files: [new File(["bad"], "bad.svg", { type: "image/svg+xml" })],
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Usa hasta 3 fotos");
    expect(screen.queryByAltText("Foto de referencia 1")).not
      .toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Generar mi póster/ })).not
      .toBeInTheDocument();
  });
});
