import { render, screen } from "@testing-library/react";
import { SortSelect } from "./SortSelect";

describe("SortSelect", () => {
  it("renders select with three options: Featured, Newest, Oldest", async () => {
    const { asFragment } = render(
      <SortSelect disabled={false} required={false} />
    );

    const select = screen.getByLabelText("Sort by:");
    const featuredOption = screen.getByRole("option", { name: "Featured" });
    const newestOption = screen.getByRole("option", { name: "Newest" });
    const oldestOption = screen.getByRole("option", { name: "Oldest" });

    expect(select).toBeInTheDocument();
    expect(select).not.toBeDisabled();
    expect(select).not.toBeRequired();
    expect(featuredOption).toBeInTheDocument();
    expect(newestOption).toBeInTheDocument();
    expect(oldestOption).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("disables select", async () => {
    render(<SortSelect disabled={true} required={false} />);

    const select = screen.getByLabelText("Sort by:");
    const featuredOption = screen.getByRole("option", { name: "Featured" });
    const newestOption = screen.getByRole("option", { name: "Newest" });
    const oldestOption = screen.getByRole("option", { name: "Oldest" });

    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();
    expect(featuredOption).toBeInTheDocument();
    expect(newestOption).toBeInTheDocument();
    expect(oldestOption).toBeInTheDocument();
  });

  it("requires select", async () => {
    render(<SortSelect disabled={false} required={true} />);

    const select = screen.getByLabelText("Sort by:");
    const featuredOption = screen.getByRole("option", { name: "Featured" });
    const newestOption = screen.getByRole("option", { name: "Newest" });
    const oldestOption = screen.getByRole("option", { name: "Oldest" });

    expect(select).toBeInTheDocument();
    expect(select).toBeRequired();
    expect(featuredOption).toBeInTheDocument();
    expect(newestOption).toBeInTheDocument();
    expect(oldestOption).toBeInTheDocument();
  });
});
