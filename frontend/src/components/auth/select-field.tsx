import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/auth/text-field';
import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SelectFieldProps = {
  placeholder: string;
  searchPlaceholder: string;
  value: string | null;
  options: string[];
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function SelectField({
  placeholder,
  searchPlaceholder,
  value,
  options,
  onChange,
  invalid,
}: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLocaleLowerCase('tr-TR');
    if (!trimmed) return options;
    return options.filter((option) => option.toLocaleLowerCase('tr-TR').includes(trimmed));
  }, [options, query]);

  function handleOpen() {
    setQuery('');
    setOpen(true);
  }

  function handleSelect(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[
          styles.trigger,
          { backgroundColor: theme.softBlue, borderColor: invalid ? theme.error : 'transparent' },
        ]}>
        <Text style={[styles.triggerText, { color: value ? theme.text : theme.muted }]}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.muted} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={styles.sheetHeader}>
            <TextField
              placeholder={searchPlaceholder}
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={styles.searchInput}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => handleSelect(item)}>
                <Text style={[styles.rowText, { color: theme.text }]}>{item}</Text>
                {item === value ? <Ionicons name="checkmark" size={18} color={theme.primary} /> : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.muted }]}>Sonuç bulunamadı</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const SHEET_HEIGHT = '72%';

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.control,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  triggerText: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 14.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 23, 68, 0.4)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHeader: {
    marginBottom: 12,
  },
  searchInput: {
    borderRadius: Radius.control,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowText: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 15,
  },
  empty: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});
