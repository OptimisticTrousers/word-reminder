import { render } from "@testing-library/react";

import { useDisableScroll } from "./useDisableScroll";

describe("useDisableScroll", () => {
  function TestComponent() {
    useDisableScroll();

    return <div></div>;
  }

  it("sets the overflow of the document to hidden", async () => {
    render(<TestComponent />);

    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("removes the overflow of the document when unmounted", async () => {
    const { unmount } = render(<TestComponent />);

    unmount();

    expect(document.documentElement.style.overflow).toBe("");
  });
});
