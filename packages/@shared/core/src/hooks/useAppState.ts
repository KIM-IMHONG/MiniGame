import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type AppStateChangeHandler = (state: AppStateStatus) => void;

export function useAppState(onChange?: AppStateChangeHandler) {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
      onChangeRef.current?.(nextState);
    });

    return () => subscription.remove();
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
  };
}
