import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './navigation/types';

type NotFoundScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotFound'>;

const NotFoundScreen = () => {
    const navigation = useNavigation<NotFoundScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>This screen doesn't exist.</Text>

            <TouchableOpacity onPress={() => navigation.replace('Home')}>
                <Text style={styles.linkText}>Go to home screen!</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 15,
        paddingVertical: 15,
        fontSize: 14,
        color: '#2e78b7',
    },
});

export default NotFoundScreen;
