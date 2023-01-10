import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Reducer from '../redux/_reducers';
import ReduxThunk from 'redux-thunk';

const store = configureStore({
  reducer: Reducer,
  middleware: [ReduxThunk],
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
        <Component {...pageProps} />
    </Provider>
  )
}
