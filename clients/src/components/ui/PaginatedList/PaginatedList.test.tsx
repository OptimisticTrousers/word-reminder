import { createRoutesStub } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import { PaginatedList } from "./PaginatedList";
import userEvent from "@testing-library/user-event";

vi.mock("../ErrorMessage/ErrorMessage");

vi.mock("../Loading/Loading");

vi.mock("../NoMore", function () {
  return {
    NoMore: function ({ name }: { name: string }) {
      return (
        <p id="name" aria-labelledby="name">
          {name}
        </p>
      );
    },
  };
});

describe("PaginatedList component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const name = "User Words";
  const route = "userWords"
  const errorMessage = "Error message";

  describe("when it is successful", () => {
    const props = {
      name,
      totalRows: "3",
      list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
      isLoading: false,
      isSuccess: true,
      error: null,
      previous: undefined,
      next: undefined,
      setPagination: vi.fn(),
    };

    it("renders list", async () => {
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders that there are no things in the list when it is empty", () => {
      const props = {
        name,
        totalRows: "0",
        list: [],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: undefined,
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.getByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("when it is loading", () => {
    it("renders that it is loading", async () => {
      const props = {
        name,
        totalRows: "0",
        list: [],
        isLoading: true,
        isSuccess: false,
        error: null,
        previous: undefined,
        next: undefined,
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.getByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("when there is an error", () => {
    it("renders error message", async () => {
      const props = {
        name,
        totalRows: "0",
        list: [],
        isLoading: false,
        isSuccess: false,
        error: new Error(errorMessage),
        previous: undefined,
        next: undefined,
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.getByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("pagination", () => {
    it("renders pagination links when there is a previous and a next page", async () => {
      const props = {
        name,
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: { page: 1, limit: 3 },
        next: { page: 1, limit: 3 },
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.getByRole("button", { name: "Previous" });
      const nextButton = screen.getByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("paginates when the user clicks the previous or next page", async () => {
      const mockSetPagination = vi.fn();
      const props = {
        name,
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: { page: 1, limit: 3 },
        next: { page: 1, limit: 3 },
        setPagination: mockSetPagination,
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);
      render(<Stub initialEntries={[`/${route}`]} />);
      const user = userEvent.setup();

      const previousButton = screen.getByRole("button", { name: "Previous" });
      const nextButton = screen.getByRole("button", { name: "Next" });
      await user.click(previousButton);
      await user.click(nextButton);

      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(mockSetPagination).toHaveBeenCalledTimes(2);
      expect(mockSetPagination).toHaveBeenCalledWith(
        props.previous.limit,
        props.previous.page
      );
      expect(mockSetPagination).toHaveBeenCalledWith(
        props.next.limit,
        props.next.page
      );
    });

    it("renders the previous pagination link when there is a previous page but not a next page", async () => {
      const props = {
        name,
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: { page: 1, limit: 3 },
        next: undefined,
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.getByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders the next pagination link when there is a next page but not a previous page", async () => {
      const props = {
        name,
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: { page: 1, limit: 3 },
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.getByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders no pagination links when there is no previous or next page", async () => {
      const props = {
        name,
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: undefined,
        setPagination: vi.fn(),
      };
      const Stub = createRoutesStub([
        {
          path: `/${route}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${route}`]} />);

      const heading = screen.getByRole("heading", { name: "User Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByTestId("error-message");
      const loading = screen.queryByTestId("loading");
      const previousButton = screen.queryByRole("button", { name: "Previous" });
      const nextButton = screen.queryByRole("button", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
