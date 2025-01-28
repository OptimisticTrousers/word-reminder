import { createRoutesStub } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import { PaginatedList } from "./PaginatedList";

vi.mock("../ErrorMessage", function () {
  return {
    ErrorMessage: function ({ message }: { message: string }) {
      return (
        <p id="message" aria-labelledby="message">
          {message}
        </p>
      );
    },
  };
});

vi.mock("../Loading", function () {
  return {
    Loading: function () {
      return (
        <p id="loading" aria-labelledby="loading">
          Loading...
        </p>
      );
    },
  };
});

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

  const name = "words";
  const errorMessage = "Error message";
  const loadingMessage = "Loading...";

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
    };

    it("renders list", async () => {
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", {
        name: loadingMessage,
      });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders that there are no things in the list when it is empty", () => {
      const props = {
        name: "words",
        totalRows: "0",
        list: [],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: undefined,
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.getByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("when it is loading", () => {
    it("renders that it is loading", async () => {
      const props = {
        name: "words",
        totalRows: "0",
        list: [],
        isLoading: true,
        isSuccess: false,
        error: null,
        previous: undefined,
        next: undefined,
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.getByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("when there is an error", () => {
    it("renders error message", async () => {
      const props = {
        name: "words",
        totalRows: "0",
        list: [],
        isLoading: false,
        isSuccess: false,
        error: new Error(errorMessage),
        previous: undefined,
        next: undefined,
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.queryAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.getByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(0);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("pagination", () => {
    it("renders pagination links when there is a previous and a next page", async () => {
      const props = {
        name: "words",
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: { page: 1, limit: 3 },
        next: { page: 1, limit: 3 },
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.getByRole("link", { name: "Previous" });
      const nextLink = screen.getByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).toBeInTheDocument();
      expect(nextLink).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders the previous pagination link when there is a previous page but not a next page", async () => {
      const props = {
        name: "words",
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: { page: 1, limit: 3 },
        next: undefined,
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.getByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders the next pagination link when there is a next page but not a previous page", async () => {
      const props = {
        name: "words",
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: { page: 1, limit: 3 },
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.getByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders no pagination links when there is no previous or next page", async () => {
      const props = {
        name: "words",
        totalRows: "3",
        list: [<li key={1}></li>, <li key={2}></li>, <li key={3}></li>],
        isLoading: false,
        isSuccess: true,
        error: null,
        previous: undefined,
        next: undefined,
      };
      const Stub = createRoutesStub([
        {
          path: `/${name}`,
          Component: function () {
            return <PaginatedList {...props} />;
          },
        },
      ]);

      const { asFragment } = render(<Stub initialEntries={[`/${name}`]} />);

      const heading = screen.getByRole("heading", { name: "Words" });
      const listItems = screen.getAllByRole("listitem", { name: "" });
      const emptyList = screen.queryByRole("paragraph", {
        name,
      });
      const error = screen.queryByRole("paragraph", { name: errorMessage });
      const loading = screen.queryByRole("paragraph", { name: loadingMessage });
      const previousLink = screen.queryByRole("link", { name: "Previous" });
      const nextLink = screen.queryByRole("link", { name: "Next" });
      expect(heading).toBeInTheDocument();
      expect(listItems).toHaveLength(3);
      expect(loading).not.toBeInTheDocument();
      expect(emptyList).not.toBeInTheDocument();
      expect(error).not.toBeInTheDocument();
      expect(previousLink).not.toBeInTheDocument();
      expect(nextLink).not.toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
