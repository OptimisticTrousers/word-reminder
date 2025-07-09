import { act, render, screen } from "@testing-library/react";

import laRocherDeBaumeImage from "../../../assets/test/la-rocher-de-baume.jpg";
import legoImage from "../../../assets/test/lego.jpg";
import selfParkingSignImage from "../../../assets/test/self-parking-sign.jpg";
import { ImageCarousel } from "./ImageCarousel";
import userEvent from "@testing-library/user-event";

describe("ImageCarousel component", () => {
  const images = [
    {
      id: 1,
      word_id: 1,
      url: laRocherDeBaumeImage,
      descriptionurl: "/descriptionurl1",
      comment: "La Rocher De La Baume",
    },
    {
      id: 2,
      word_id: 1,
      url: legoImage,
      descriptionurl: "/descriptionurl2",
      comment: "Crowd Lego Staff",
    },
    {
      id: 3,
      word_id: 1,
      url: selfParkingSignImage,
      descriptionurl: "/descriptionurl3",
      comment: "UFO Parking Sign",
    },
  ];

  it("shows the first image by default", async () => {
    const { asFragment } = render(<ImageCarousel images={images} />);
    const user = userEvent.setup();
    const toggleAutoScrollButton = screen.getByRole("button", {
      name: "Disable Auto Scroll",
    });
    // toggles auto scroll off
    await user.click(toggleAutoScrollButton);

    const count = screen.getByText("1/3");
    const image = screen.getByRole("presentation");
    const caption = screen.getByText(images[0].comment);
    const link = screen.getByRole("link");
    const previousButton = screen.getByRole("button", {
      name: "Previous image",
    });
    const nextButton = screen.getByRole("button", { name: "Next image" });
    const toggleAutoScroll = screen.getByRole("button", {
      name: "Enable Auto Scroll",
    });
    expect(toggleAutoScroll).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", images[0].descriptionurl);
    expect(count).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/src/assets/test/la-rocher-de-baume.jpg"
    );
    expect(caption).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows images placeholder and does not show any buttons when there are no images", async () => {
    const { asFragment } = render(<ImageCarousel images={[]} />);

    const count = screen.getByText("0/0");
    const image = screen.getByRole("presentation");
    const caption = screen.getByText("No Images Available");
    const link = screen.queryByRole("link");
    const previousButton = screen.queryByRole("button", {
      name: "Previous image",
    });
    const nextButton = screen.queryByRole("button", { name: "Next image" });
    const toggleAutoScroll = screen.queryByRole("button", {
      name: "Disable Auto Scroll",
    });
    expect(toggleAutoScroll).not.toBeInTheDocument();
    expect(previousButton).not.toBeInTheDocument();
    expect(nextButton).not.toBeInTheDocument();
    expect(link).not.toBeInTheDocument();
    expect(count).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/src/assets/images/no-image-available.jpg"
    );
    expect(caption).toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });

  describe("auto scrolling", () => {
    const delay = 5000;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.stubGlobal("jest", {
        advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
      });
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    afterAll(() => {
      vi.unstubAllGlobals();
    });

    it("enables auto scrolling by default", async () => {
      const { unmount } = render(<ImageCarousel images={images} />);

      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      expect(toggleAutoScrollButton).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("scrolls to the next image in 5 seconds", async () => {
      const { unmount } = render(<ImageCarousel images={images} />);
      act(() => {
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[1].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("scrolls to to the last image in 10 seconds", () => {
      const { unmount } = render(<ImageCarousel images={images} />);
      act(() => {
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[2].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("scrolls to the first image in 15 seconds", () => {
      const { unmount } = render(<ImageCarousel images={images} />);
      act(() => {
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("1/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[0].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[0].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("disables auto scrolling when the user toggles it off", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime.bind(vi),
      });

      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      await user.click(toggleAutoScrollButton);

      expect(toggleAutoScrollButton).toHaveTextContent("Enable Auto Scroll");
    });

    it("enables auto scrolling when the user toggles it back on after toggling it off", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup({ delay: null });

      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      await user.click(toggleAutoScrollButton);
      await user.click(toggleAutoScrollButton);

      expect(toggleAutoScrollButton).toHaveTextContent("Disable Auto Scroll");
    });
  });

  describe("clicking previous", () => {
    it("goes to the previous image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);
      const thirdImageDot = screen.getByRole("button", {
        name: "Show image 3",
      });
      await user.click(thirdImageDot);

      const previousButton = screen.getByRole("button", {
        name: "Previous image",
      });
      await user.click(previousButton);

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[1].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("goes to the last image when on the first image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);

      const previousButton = screen.getByRole("button", {
        name: "Previous image",
      });
      await user.click(previousButton);

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[2].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "/src/assets/test/self-parking-sign.jpg"
      );
      expect(caption).toBeInTheDocument();
    });
  });

  describe("next", () => {
    it("goes to the next image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);

      const nextButton = screen.getByRole("button", {
        name: "Next image",
      });
      await user.click(nextButton);

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[1].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("goes to the first image when on the last image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);
      const thirdImageDot = screen.getByRole("button", {
        name: "Show image 3",
      });
      await user.click(thirdImageDot);

      const nextButton = screen.getByRole("button", {
        name: "Next image",
      });
      await user.click(nextButton);

      const count = screen.getByText("1/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[0].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[0].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "/src/assets/test/la-rocher-de-baume.jpg"
      );
      expect(caption).toBeInTheDocument();
    });
  });

  describe("dots", () => {
    it("clicking on dot goes to that nth image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);

      const secondImageDot = screen.getByRole("button", {
        name: "Show image 2",
      });
      await user.click(secondImageDot);

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[1].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("clicking on the first dot goes to the first image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);
      const thirdImageDot = screen.getByRole("button", {
        name: "Show image 3",
      });
      await user.click(thirdImageDot);

      const firstImageDot = screen.getByRole("button", {
        name: "Show image 1",
      });
      await user.click(firstImageDot);

      const count = screen.getByText("1/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[0].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[0].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "/src/assets/test/la-rocher-de-baume.jpg"
      );
      expect(caption).toBeInTheDocument();
    });

    it("clicking on the last dot goes to the last image", async () => {
      render(<ImageCarousel images={images} />);
      const user = userEvent.setup();
      const toggleAutoScrollButton = screen.getByRole("button", {
        name: "Disable Auto Scroll",
      });
      // toggles auto scroll off
      await user.click(toggleAutoScrollButton);

      const thirdImageDot = screen.getByRole("button", {
        name: "Show image 3",
      });
      await user.click(thirdImageDot);

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].comment);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", images[2].descriptionurl);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "/src/assets/test/self-parking-sign.jpg"
      );
      expect(caption).toBeInTheDocument();
    });
  });
});
