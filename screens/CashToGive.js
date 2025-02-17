import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CashToGive = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => navigation.navigate('QRScanner', {
                    onScan: (data) => {
                        // Handle scanned data
                        console.log('Scanned:', data);
                    }
                })}
            >
                <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: '#000000',
        padding: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FFE4B5',
    },
    buttonText: {
        color: '#FFE4B5',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CashToGive; 