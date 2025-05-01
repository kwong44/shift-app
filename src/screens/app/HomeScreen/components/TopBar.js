import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Avatar, Menu, Divider } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

const TopBar = ({ userName, onSignOut, greeting }) => {
  const [userMenuVisible, setUserMenuVisible] = React.useState(false);

  const toggleUserMenu = async () => {
    await Haptics.selectionAsync();
    setUserMenuVisible(!userMenuVisible);
  };

  return (
    <View style={styles.topBar}>
      <Text style={styles.greetingText}>{greeting},</Text>
      <TouchableOpacity 
        onPress={toggleUserMenu} 
        style={styles.profileButton}
        accessible={true}
        accessibilityLabel="User profile menu"
        accessibilityHint="Opens the user profile and settings menu"
      >
        <Avatar.Text 
          size={40} 
          label={userName.charAt(0)} 
          backgroundColor={COLORS.primary}
          color={COLORS.textOnColor}
        />
        <Menu
          visible={userMenuVisible}
          onDismiss={() => setUserMenuVisible(false)}
          anchor={{ x: Dimensions.get('window').width - 40, y: 60 }}
          contentStyle={styles.menuContent}
        >
          <Menu.Item 
            leadingIcon="account-outline" 
            onPress={() => setUserMenuVisible(false)} 
            title="My Profile" 
          />
          <Menu.Item 
            leadingIcon="cog-outline" 
            onPress={() => setUserMenuVisible(false)} 
            title="Settings" 
          />
          <Divider />
          <Menu.Item 
            leadingIcon="logout" 
            onPress={() => {
              setUserMenuVisible(false);
              onSignOut();
            }} 
            title="Sign Out"
            titleStyle={{ color: COLORS.error }}
          />
        </Menu>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  greetingText: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
  },
  profileButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  menuContent: {
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
});

export default TopBar; 