import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import COLORS from '../config/COLORS';
import colors from '../constants/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const HeaderNav = ({
  onPress,
  title,
  icon = null,
}: {
  onPress: () => void;
  title: string;
  icon?: any;
}) => {
  const colorScheme = useColorScheme();
  const colors = COLORS();

  const iconMap: { [key: string]: any } = {
    bnpb: require('../assets/icons/bnpb-logo.png'),
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.header }]}>
      <TouchableOpacity
        onPress={onPress}
        style={icon ? styles.withIconSpacing : {}}>
        <AntDesign name="arrowleft" size={24} color={colors.tabIconDefault} />
      </TouchableOpacity>

      {icon ? (
        <View style={styles.titleContainerWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: colors.cardBackground },
            ]}>
            <Image source={iconMap[icon]} style={styles.iconImage} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      ) : (
        <Text style={[styles.titleCenter, { color: colors.text }]}>{title}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '3%',
    paddingTop: '10%',
  },
  withIconSpacing: {
    marginRight: 10,
  },
  titleContainerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  titleCenter: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});
