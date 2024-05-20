import {
  SDKProvider,
  useBackButton,
  retrieveLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars, bindViewportCSSVars,
} from '@tma.js/sdk-react';
import { type FC, useEffect, useMemo } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useRouter as useNavigationRouter } from 'next/navigation';

import "./globals.css";


const BackButtonManipulator: FC = () => {
  const router = useRouter();
  const { back } = useNavigationRouter();
  const bb = useBackButton();

  useEffect(() => {
    if (router.pathname === '/') {
      bb.hide();
    } else {
      bb.show();
    }
  }, [router, bb]);

  useEffect(() => bb.on('click', back), [bb, back]);

  return null;
};

const App: FC<AppProps> = ({ pageProps, Component }) => {
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    if (viewport) {
      return bindViewportCSSVars(viewport);
    }
  }, [viewport]);

  return (
    <>
      <BackButtonManipulator/>
      <Component {...pageProps}/>
    </>
  );
};

const Inner: FC<AppProps> = (props) => {
  const debug = useMemo(() => {
    return typeof window === 'undefined' ? false : retrieveLaunchParams().startParam === 'debug';
  }, []);
  const manifestUrl = useMemo(() => {
    return typeof window === 'undefined'
      ? ''
      : new URL('tonconnect-manifest.json', window.location.href).toString();
  }, []);

  useEffect(() => {
    if (debug) {
      import('eruda').then(lib => lib.default.init());
    }
  }, [debug]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <SDKProvider acceptCustomStyles debug={debug}>
        <App {...props}/>
      </SDKProvider>
    </TonConnectUIProvider>
  );
};

export default function CustomApp(props: AppProps) {
  return (
    <Inner {...props}/>
  );
};
