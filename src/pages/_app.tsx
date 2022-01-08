import GlobalStyle from "@styles/GlobalStyle";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContextProvider } from "@context/appContext";
import importFontAwesomeIcons from "@utils/importFontAwesomeIcons";

// Import Fontawesome Icons
importFontAwesomeIcons();

function App({ Component, pageProps }: AppProps) {
	return (
		<AppContextProvider>
			<SessionProvider session={pageProps.session}>
				<Head>
					<title>Melvin</title>
					<link rel="shortcut icon" type="image/png" href="/melvin.png" />
				</Head>
				<GlobalStyle />
				<Component {...pageProps} />

				<ToastContainer />
			</SessionProvider>
		</AppContextProvider>
	);
}

export default App;
