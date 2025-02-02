import { Detail } from "common";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserWord } from "./UserWord";
import { MemoryRouter } from "react-router-dom";

vi.mock("../CondensedWord/CondensedWord", () => {
  return {
    CondensedWord: function ({ details }: { details: Detail[] }) {
      return (
        <>
          <div data-testid="details">{JSON.stringify(details)}</div>
        </>
      );
    },
  };
});

vi.mock("../../modals/DeleteUserWordModal", () => {
  return {
    DeleteUserWordModal: function () {
      return <div data-testid="modal"></div>;
    },
  };
});

const props = {
  id: "1",
  word_id: "1",
  user_id: "1",
  learned: false,
  updated_at: new Date("December 17, 1995 03:24:00"),
  created_at: new Date("December 17, 1995 03:24:00"),
  details: [{ word: "exemplary", phonetics: [], meanings: [] }],
};

describe("UserWord component", () => {
  it("does not renders the word by default", async () => {
    render(
      <MemoryRouter>
        <UserWord {...props} />
      </MemoryRouter>
    );

    const details = screen.queryByTestId("details");
    expect(details).not.toBeInTheDocument();
  });

  it("it opens delete modal", async () => {
    render(
      <MemoryRouter>
        <UserWord {...props} />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    const deleteButton = screen.getByRole("button", {
      name: "Open delete user word modal",
    });
    await user.click(deleteButton);

    const deleteModal = screen.getByTestId("modal");
    expect(deleteModal).toBeInTheDocument();
  });

  it("it opens the accordion", async () => {
    const { asFragment } = render(
      <MemoryRouter>
        <UserWord {...props} />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);

    const details = screen.getByTestId("details");
    expect(details).toHaveTextContent(JSON.stringify(props.details));
    expect(asFragment()).toMatchSnapshot();
  });

  it("it closes the accordion", async () => {
    render(
      <MemoryRouter>
        <UserWord {...props} />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);
    await user.click(infoButton);

    const details = screen.queryByTestId("details");
    expect(details).not.toBeInTheDocument();
  });
});
