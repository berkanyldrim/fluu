import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

const SIZE = 60;

const LIGHT_LOGO = require('../../../../design/assets/fluu-logo-light.png');
const DARK_LOGO = require('../../../../design/assets/fluu-logo-dark.png');

export function BrandMark() {
  const scheme = useColorScheme();
  const source = scheme === 'dark' ? DARK_LOGO : LIGHT_LOGO;

  return <Image source={source} style={styles.mark} contentFit="contain" />;
}

const styles = StyleSheet.create({
  mark: {
    width: SIZE,
    height: SIZE,
    marginBottom: 26,
  },
});
