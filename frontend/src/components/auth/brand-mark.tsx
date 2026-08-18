import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const SIZE = 60;

// TODO(design): fluu-logo-light.png / fluu-logo-dark.png design/ klasörüne eklenince
// bu placeholder yerine gerçek logo (tema class'ına göre seçilen) kullanılacak.
export function BrandMark() {
  const theme = useTheme();

  return <View style={[styles.mark, { backgroundColor: theme.primary }]} />;
}

const styles = StyleSheet.create({
  mark: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE * 0.22,
    marginBottom: 26,
  },
});
