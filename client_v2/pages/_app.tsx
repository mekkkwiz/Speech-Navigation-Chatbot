import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Reducer from "../redux/_reducers";
import ReduxThunk from "redux-thunk";
import "regenerator-runtime/runtime";

import { Sarabun } from "@next/font/google";

// Noto Sans Thai
const font = Sarabun({
  subsets: ["thai", "latin"],
  weight: "400",
});

const store = configureStore({
  reducer: Reducer,
  middleware: [ReduxThunk],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <main>
        <style jsx global>{`
          html {
            font-family: ${font.style.fontFamily};
          }
        `}</style>
        <Component {...pageProps} />
      </main>
    </Provider>
  );
}
