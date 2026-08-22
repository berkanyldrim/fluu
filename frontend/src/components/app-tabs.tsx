import { Ionicons } from '@expo/vector-icons';
import { VectorIcon } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="stories">
        <NativeTabs.Trigger.Label>Hikayeler</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={<VectorIcon family={Ionicons} name="images-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shuffle">
        <NativeTabs.Trigger.Label>Shuffle</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={<VectorIcon family={Ionicons} name="shuffle-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="match">
        <NativeTabs.Trigger.Label>Sohbet Bul</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={<VectorIcon family={Ionicons} name="flash-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label>Sohbetlerim</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={<VectorIcon family={Ionicons} name="chatbubbles-outline" />} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={<VectorIcon family={Ionicons} name="person-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
