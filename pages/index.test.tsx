import { render, screen, waitFor } from "@testing-library/react";
import App from "./index";

describe("App", () => {
  it("renders without crashing", async () => {
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Welcome!" })
      ).toBeInTheDocument()
    })
  })
})
