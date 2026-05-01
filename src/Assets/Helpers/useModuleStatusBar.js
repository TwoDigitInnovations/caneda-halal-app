import {useCallback, useContext} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {StatusBarContext} from '../../../App';

const useModuleStatusBar = config => {
  const [, setStatusBar] = useContext(StatusBarContext);
  useFocusEffect(
    useCallback(() => {
      setStatusBar(config);
    }, []),
  );
};

export default useModuleStatusBar;
