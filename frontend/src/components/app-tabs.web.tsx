import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { name: 'stories', href: '/stories', label: 'Hikayeler', icon: 'images-outline' },
  { name: 'shuffle', href: '/shuffle', label: 'Shuffle', icon: 'shuffle-outline' },
  { name: 'match', href: '/match', label: 'Sohbet Bul', icon: 'flash-outline' },
  { name: 'chats', href: '/chats', label: 'Sohbetlerim', icon: 'chatbubbles-outline' },
  { name: 'profile', href: '/profile', label: 'Profil', icon: 'person-outline' },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <ThemedView type="backgroundElement" style={styles.tabList}>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </ThemedView>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap };

function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={styles.tabButton}>
      <Ionicons name={icon} size={22} color={isFocused ? theme.text : theme.textSecondary} />
      <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'} style={styles.tabLabel}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
});
