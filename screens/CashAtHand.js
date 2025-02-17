import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MapView, { Marker } from 'react-native-maps';

const CashAtHand = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        amount: ''
    });
    const [qrData, setQrData] = useState(null);

    const generateQR = () => {
        if (formData.name && formData.phone && formData.amount) {
            setQrData(JSON.stringify(formData));
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Amount Needed"
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={(text) => setFormData({...formData, amount: text})}
                />
                <TouchableOpacity 
                    style={styles.button}
                    onPress={generateQR}
                >
                    <Text style={styles.buttonText}>Generate QR Code</Text>
                </TouchableOpacity>
            </View>

            {qrData && (
                <View style={styles.qrContainer}>
                    <QRCode
                        value={qrData}
                        size={200}
                    />
                </View>
            )}

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: -26.2041,
                        longitude: 28.0473,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    formSection: {
        padding: 20,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#000000',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#000000',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFE4B5',
        fontSize: 16,
        fontWeight: 'bold',
    },
    qrContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        margin: 20,
        borderRadius: 10,
        elevation: 3,
    },
    mapContainer: {
        height: 400,
        margin: 20,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#000000',
    },
    map: {
        flex: 1,
    },
});

export default CashAtHand; 