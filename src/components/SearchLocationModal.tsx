import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { MAPBOX_ACCESS_TOKEN } from '../services/apiServices';

interface SearchLocationModalProps {
    visible: boolean;
    onClose: (selectedLocation: { id: number; name: string; address: string } | null) => void;
    fetchLocations: (query: string) => Promise<{ id: number; name: string; address: string }[]>;
}

const SearchLocationModal: React.FC<SearchLocationModalProps> = ({ visible, onClose, fetchLocations }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>([]);

    const handleSearch = async (text: any) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    text,
                )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=20&country=id`,
            );
            const data = await response.json();

            if (data.features) {
                setSearchResults(
                    data.features.map((place: any) => ({
                        id: place.id,
                        name: place.place_name,
                        lat: place.center[1], // Latitude
                        lon: place.center[0], // Longitude
                    })),
                );
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleSelectLocation = (location: any) => {
        onClose(location)
    };

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={() => onClose(null)}>
            <View style={styles.modalContainer}>
                {/* Header Modal */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        style={styles.headerBackButtonModal}
                        onPress={() => onClose(null)}>
                        <AntDesign name="arrowleft" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.headerSearchContainerModal}>
                        <Feather name="search" size={18} color="gray" style={styles.headerSearchIconModal} />
                        <TextInput
                            placeholder="Cari Lokasi"
                            style={styles.headerSearchInputModal}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>
                </View>

                {/* List hasil pencarian */}
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={() => (
                        <Text style={styles.resultHeader}>Hasil Pencarian</Text>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultItem}
                            onPress={() => handleSelectLocation(item)}>
                            <View style={styles.resultIconContainer}>
                                <Feather name="map-pin" size={20} color="gray" />
                            </View>
                            <View style={styles.resultTextContainer}>
                                <Text style={styles.resultTitle}>{item.name}</Text>
                                <Text style={styles.resultSubtitle}>{item.address}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
        </Modal>
    );
};

export default SearchLocationModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(126, 126, 126, 0.3)',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    resultHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
        marginHorizontal: 16,
    },
    headerSearchContainerModal: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
    },
    headerSearchIconModal: {
        marginRight: 5,
    },
    headerSearchInputModal: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    resultIconContainer: {
        marginRight: 12,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    resultSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    headerBackButtonModal: {
        marginRight: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        padding: 8,
        borderRadius: 10,
    },
});
