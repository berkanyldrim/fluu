import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type StepDotsProps = {
  total: number;
  activeCount: number;
};

export function StepDots({ total, activeCount }: StepDotsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index < activeCount ? theme.primary : theme.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  dot: {
    width: 22,
    height: 5,
    borderRadius: 3,
  },
});
