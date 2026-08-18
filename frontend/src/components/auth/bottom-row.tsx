import { StyleSheet, Text, View } from 'react-native';

import { LinkText } from '@/components/auth/link-text';
import { NunitoFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BottomRowProps = {
  question: string;
  actionTitle: string;
  onPress: () => void;
};

export function BottomRow({ question, actionTitle, onPress }: BottomRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.question, { color: theme.muted }]}>{question}</Text>
      <LinkText title={actionTitle} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 24,
  },
  question: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 13,
  },
});
