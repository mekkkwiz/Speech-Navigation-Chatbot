import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Reducer from '../redux/_reducers';
import ReduxThunk from 'redux-thunk';

import { Noto_Sans_Thai_Looped } from '@next/font/google'


// Noto Sans Thai
const noto_sans_thai = Noto_Sans_Thai_Looped({
  subsets: ['thai'],
  weight: "400",
})

const store = configureStore({
  reducer: Reducer,
  middleware: [ReduxThunk],
})


export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <main className={noto_sans_thai.className}>
        <Component {...pageProps} />
      </main>
    </Provider>
  )
}
