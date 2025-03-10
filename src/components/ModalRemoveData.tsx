import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ModalRemoveDataProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ModalRemoveData: React.FC<ModalRemoveDataProps> = ({ visible, onClose, onConfirm, title, message }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.dangerButtonOutline]}>
                            <Text style={styles.buttonText}>Hapus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                            <Text style={styles.buttonTextCancel}>Batalkan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '100%',
        height: '50%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalActions: {
        width: '100%',
    },
    button: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#4F4D4A',
    },
    dangerButtonOutline: {
        borderWidth: 1,
        borderColor: '#E64040',
        backgroundColor: 'transparent',
        marginBottom: 10,
    },
    buttonTextCancel: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonText: {
        color: '#E64040',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ModalRemoveData;
