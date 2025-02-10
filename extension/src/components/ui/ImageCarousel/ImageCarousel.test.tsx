import { act, render, screen } from "@testing-library/react";

import laRocherDeBaumeImage from "../../../assets/test/la-rocher-de-baume.jpg";
import legoImage from "../../../assets/test/lego.jpg";
import selfParkingSignImage from "../../../assets/test/self-parking-sign.jpg";
import { ImageCarousel } from "./ImageCarousel";
import userEvent from "@testing-library/user-event";

describe("ImageCarousel component", () => {
  const images = [
    { src: laRocherDeBaumeImage, caption: "La Rocher De La Baume" },
    { src: legoImage, caption: "Crowd Lego Staff" },
    { src: selfParkingSignImage, caption: "UFO Parking Sign" },
  ];

  it("shows the first image by default", () => {
    const { asFragment } = render(
      <ImageCarousel images={images} hasAutoScroll={false} />
    );

    const count = screen.getByText("1/3");
    const image = screen.getByRole("presentation");
    const caption = screen.getByText(images[0].caption);
    expect(count).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/src/assets/test/la-rocher-de-baume.jpg"
    );
    expect(caption).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("shows no images placeholder when there are no images", () => {
    const { asFragment } = render(
      <ImageCarousel images={[]} hasAutoScroll={false} />
    );

    const count = screen.getByText("0/0");
    const image = screen.getByRole("presentation");
    const caption = screen.getByText("No Images Available");
    expect(count).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/src/assets/images/no-image-available.jpg"
    );
    expect(caption).toBeInTheDocument();
    expect(asFragment).toMatchSnapshot();
  });

  describe("hasAutoScroll", () => {
    const delay = 5000;

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("it scrolls to the next image in 5 seconds", async () => {
      const { unmount } = render(
        <ImageCarousel images={images} hasAutoScroll={true} />
      );
      act(() => {
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("it scrolls to to the last image in 10 seconds", () => {
      const { unmount } = render(
        <ImageCarousel images={images} hasAutoScroll={true} />
      );
      act(() => {
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });

    it("it scrolls to the first image in 15 seconds", () => {
      const { unmount } = render(
        <ImageCarousel images={images} hasAutoScroll={true} />
      );
      act(() => {
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
        vi.advanceTimersByTime(delay);
      });

      const count = screen.getByText("1/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[0].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(caption).toBeInTheDocument();
      // Prevents act() error caused by the useInterval hook continuing to run after the test finishes
      unmount();
    });
  });

  describe("clicking previous", () => {
    it("goes to the previous image", async () => {
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();
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
      const caption = screen.getByText(images[1].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("goes to the last image when on the first image", async () => {
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();

      const previousButton = screen.getByRole("button", {
        name: "Previous image",
      });
      await user.click(previousButton);

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].caption);
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
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();

      const nextButton = screen.getByRole("button", {
        name: "Next image",
      });
      await user.click(nextButton);

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("goes to the first image when on the last image", async () => {
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();
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
      const caption = screen.getByText(images[0].caption);
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
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();

      const secondImageDot = screen.getByRole("button", {
        name: "Show image 2",
      });
      await user.click(secondImageDot);

      const count = screen.getByText("2/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[1].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/src/assets/test/lego.jpg");
      expect(caption).toBeInTheDocument();
    });

    it("clicking on the first dot goes to the first image", async () => {
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();
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
      const caption = screen.getByText(images[0].caption);
      expect(count).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "/src/assets/test/la-rocher-de-baume.jpg"
      );
      expect(caption).toBeInTheDocument();
    });

    it("clicking on the last dot goes to the last image", async () => {
      render(<ImageCarousel images={images} hasAutoScroll={false} />);
      const user = userEvent.setup();

      const thirdImageDot = screen.getByRole("button", {
        name: "Show image 3",
      });
      await user.click(thirdImageDot);

      const count = screen.getByText("3/3");
      const image = screen.getByRole("presentation");
      const caption = screen.getByText(images[2].caption);
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
