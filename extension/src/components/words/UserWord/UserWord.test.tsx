import { UserWord as IUserWord, Word as IWord } from "common";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserWord } from "./UserWord";

vi.mock("../Word", () => {
  return {
    Word: function (props: IUserWord & IWord) {
      return (
        <>
          <div data-testid="id">{props.id}</div>
          <div data-testid="word_id">{props.word_id}</div>
          <div data-testid="user_id">{props.user_id}</div>
          <div data-testid="learned">{JSON.stringify(props.learned)}</div>
          <div data-testid="updated_at">{JSON.stringify(props.updated_at)}</div>
          <div data-testid="created_at">{JSON.stringify(props.created_at)}</div>
          <div data-testid="details">{JSON.stringify(props.details)}</div>
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
    render(<UserWord {...props} />);

    const wordParagraph = screen.getByText("exemplary");
    const id = screen.queryByTestId("id");
    const word_id = screen.queryByTestId("word_id");
    const user_id = screen.queryByTestId("user_id");
    const learned = screen.queryByTestId("learned");
    const updated_at = screen.queryByTestId("updated_at");
    const created_at = screen.queryByTestId("created_at");
    const details = screen.queryByTestId("details");
    expect(wordParagraph).toBeInTheDocument();
    expect(id).not.toBeInTheDocument();
    expect(word_id).not.toBeInTheDocument();
    expect(user_id).not.toBeInTheDocument();
    expect(learned).not.toBeInTheDocument();
    expect(updated_at).not.toBeInTheDocument();
    expect(created_at).not.toBeInTheDocument();
    expect(details).not.toBeInTheDocument();
  });

  it("it opens delete modal", async () => {
    render(<UserWord {...props} />);
    const user = userEvent.setup();

    const deleteButton = screen.getByRole("button", {
      name: "Open delete user word modal",
    });
    await user.click(deleteButton);

    const deleteModal = screen.getByTestId("modal");
    expect(deleteModal).toBeInTheDocument();
  });

  it("it opens the accordion", async () => {
    const { asFragment } = render(<UserWord {...props} />);
    const user = userEvent.setup();

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);

    const wordParagraph = screen.getByText("exemplary");
    const id = screen.getByTestId("id");
    const word_id = screen.getByTestId("word_id");
    const user_id = screen.getByTestId("user_id");
    const learned = screen.getByTestId("learned");
    const updated_at = screen.getByTestId("updated_at");
    const created_at = screen.getByTestId("created_at");
    const details = screen.getByTestId("details");
    expect(wordParagraph).toBeInTheDocument();
    expect(id).toHaveTextContent(props.id);
    expect(word_id).toHaveTextContent(props.word_id);
    expect(user_id).toHaveTextContent(props.user_id);
    expect(learned).toHaveTextContent(JSON.stringify(props.learned));
    expect(updated_at).toHaveTextContent(JSON.stringify(props.updated_at));
    expect(created_at).toHaveTextContent(JSON.stringify(props.created_at));
    expect(details).toHaveTextContent(JSON.stringify(props.details));
    expect(asFragment()).toMatchSnapshot();
  });

  it("it closes the accordion", async () => {
    render(<UserWord {...props} />);
    const user = userEvent.setup();

    const infoButton = screen.getByRole("button", {
      name: "More word details",
    });
    await user.click(infoButton);
    await user.click(infoButton);

    const wordParagraph = screen.getByText("exemplary");
    const id = screen.queryByTestId("id");
    const word_id = screen.queryByTestId("word_id");
    const user_id = screen.queryByTestId("user_id");
    const learned = screen.queryByTestId("learned");
    const updated_at = screen.queryByTestId("updated_at");
    const created_at = screen.queryByTestId("created_at");
    const details = screen.queryByTestId("details");
    expect(wordParagraph).toBeInTheDocument();
    expect(id).not.toBeInTheDocument();
    expect(word_id).not.toBeInTheDocument();
    expect(user_id).not.toBeInTheDocument();
    expect(learned).not.toBeInTheDocument();
    expect(updated_at).not.toBeInTheDocument();
    expect(created_at).not.toBeInTheDocument();
    expect(details).not.toBeInTheDocument();
  });
});
