import { createContext, FC, useReducer } from "react";

interface IUser {
  _id: string;
  username: string;
  theme: string;
  words: IUserWord[];
}

interface IWord {
  _id: string;
  word: string;
  origin: string;
  phonetic: string;
  audio: string;
  meanings: [
    {
      partOfSpeech: string;
      definitions: [
        {
          definition: string;
          example: string;
          synonyms: string[];
          antonyms: string[];
        }
      ];
    }
  ];
}

export interface IUserWord {
  _id: string;
  userId: IUser | string;
  word: IWord;
  learned: boolean;
}

interface AuthState {
  user: IUser | null;
}

interface Action {
  type: string;
  payload: IUser;
}

interface AuthContext {
  state: AuthState;
  dispatch: (action: Action) => void;
}

const authReducer = (state: AuthState, action: Action) => {
  switch (action.type) {
    // Login action will always contain a payload of user object
    case "LOGIN":
      return { user: action.payload };
    // Remove user object on logout action dispatch
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContext>({} as AuthContext);

interface Props {
  children: JSX.Element[] | JSX.Element;
}

const AuthProvider: FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
