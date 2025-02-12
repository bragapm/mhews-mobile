import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface FloatingSOSButtonProps {
    onPress: () => void;
}

const FloatingSOSButton: React.FC<FloatingSOSButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <Image source={require('../assets/icons/SOS.png')} style={styles.icon} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
});

export default FloatingSOSButton;
