import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInputProps } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { useTheme } from '@/hooks/use-theme';

export function PasswordField(props: TextInputProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  return (
    <TextField
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      rightSlot={
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.muted} />
        </Pressable>
      }
      {...props}
    />
  );
}
