import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { store } from "../store";
import { isDev } from "@/libs/checkEnv";




function AppProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </Provider>);
}

export default AppProvider;


// if (!isDev) {
//   console.log = () => { };
// }