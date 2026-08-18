import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/primary-button';
import { NunitoFonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const ROW_HEIGHT = 44;
// En genç seçilebilir yaş — gerçek 18+ kontrolü ayrı yapılır (bkz. schemas/auth.ts),
// bu sadece sonsuz bir yıl listesi göstermemek için makul bir üst sınır.
const YOUNGEST_SELECTABLE_AGE = 13;
const OLDEST_SELECTABLE_AGE = 100;

function daysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

type BirthDatePickerProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  invalid?: boolean;
};

export function BirthDatePicker({ value, onChange, invalid }: BirthDatePickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const currentYear = new Date().getFullYear();

  const years = useMemo(
    () =>
      Array.from(
        { length: OLDEST_SELECTABLE_AGE - YOUNGEST_SELECTABLE_AGE + 1 },
        (_, i) => currentYear - YOUNGEST_SELECTABLE_AGE - i,
      ),
    [currentYear],
  );

  const defaults = value ?? new Date(currentYear - 20, 0, 1);
  const [pendingDay, setPendingDay] = useState(defaults.getDate());
  const [pendingMonth, setPendingMonth] = useState(defaults.getMonth());
  const [pendingYear, setPendingYear] = useState(defaults.getFullYear());

  const days = useMemo(
    () => Array.from({ length: daysInMonth(pendingMonth, pendingYear) }, (_, i) => i + 1),
    [pendingMonth, pendingYear],
  );
  const selectedDayIndex = Math.min(pendingDay, days.length) - 1;

  function handleOpen() {
    const base = value ?? defaults;
    setPendingDay(base.getDate());
    setPendingMonth(base.getMonth());
    setPendingYear(base.getFullYear());
    setOpenKey((key) => key + 1);
    setOpen(true);
  }

  function handleConfirm() {
    const clampedDay = Math.min(pendingDay, daysInMonth(pendingMonth, pendingYear));
    onChange(new Date(pendingYear, pendingMonth, clampedDay));
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
          {value ? formatDate(value) : 'Doğum tarihi'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={theme.muted} />
      </Pressable>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>Doğum tarihi</Text>
          <View style={styles.columns}>
            <PickerColumn
              key={`day-${openKey}`}
              items={days.map(String)}
              selectedIndex={selectedDayIndex}
              onSelect={(index) => setPendingDay(days[index])}
            />
            <PickerColumn
              key={`month-${openKey}`}
              items={MONTHS}
              selectedIndex={pendingMonth}
              onSelect={setPendingMonth}
            />
            <PickerColumn
              key={`year-${openKey}`}
              items={years.map(String)}
              selectedIndex={years.indexOf(pendingYear)}
              onSelect={(index) => setPendingYear(years[index])}
            />
          </View>
          <PrimaryButton title="Seç" onPress={handleConfirm} />
        </SafeAreaView>
      </Modal>
    </>
  );
}

type PickerColumnProps = {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function PickerColumn({ items, selectedIndex, onSelect }: PickerColumnProps) {
  const theme = useTheme();

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => `${item}-${index}`}
      style={styles.column}
      getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
      initialScrollIndex={Math.max(0, selectedIndex - 2)}
      renderItem={({ item, index }) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            style={[styles.row, selected && { backgroundColor: theme.softBlue }]}
            onPress={() => onSelect(index)}>
            <Text
              style={[
                styles.rowText,
                { color: selected ? theme.primary : theme.text },
                selected && styles.rowTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const SHEET_HEIGHT = '62%';

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
  sheetTitle: {
    fontFamily: NunitoFonts.extraBold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  row: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.control,
  },
  rowText: {
    fontFamily: NunitoFonts.semiBold,
    fontSize: 15,
  },
  rowTextSelected: {
    fontFamily: NunitoFonts.extraBold,
  },
});
