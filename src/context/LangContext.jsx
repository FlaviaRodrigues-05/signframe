import { createContext, useContext, useState } from "react";

const LangContext = createContext({
  lang: "ASL",
  setLang: () => {},
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState("ASL");

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}