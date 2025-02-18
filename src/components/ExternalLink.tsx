import { Link } from '@react-navigation/native';
import React from 'react';
import { Linking, Platform, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  style?: object;
}

export function ExternalLink({ href, children, style }: ExternalLinkProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(href);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}