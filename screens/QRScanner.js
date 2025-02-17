import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';

const QRScanner = ({ navigation, onScan }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Camera access is needed to scan QR codes',
                    [{ text: 'OK' }]
                );
            }
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        try {
            const parsedData = JSON.parse(data);
            onScan && onScan(parsedData);
            Alert.alert(
                'QR Code Scanned',
                `Name: ${parsedData.name}\nAmount: R${parsedData.amount}`,
                [
                    {
                        text: 'Scan Again',
                        onPress: () => setScanned(false)
                    },
                    {
                        text: 'Accept',
                        onPress: () => navigation.navigate('TransactionConfirm', { data: parsedData })
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Invalid QR Code', 'This QR code is not valid for Qash Connect');
            setScanned(false);
        }
    };

    const toggleFlash = () => {
        setFlashMode(
            flashMode === Camera.Constants.FlashMode.off
                ? Camera.Constants.FlashMode.torch
                : Camera.Constants.FlashMode.off
        );
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={Camera.Constants.Type.back}
                flashMode={flashMode}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                barCodeScannerSettings={{
                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanArea}>
                        <View style={styles.cornerTL} />
                        <View style={styles.cornerTR} />
                        <View style={styles.cornerBL} />
                        <View style={styles.cornerBR} />
                    </View>
                    
                    <View style={styles.controls}>
                        <TouchableOpacity 
                            style={styles.controlButton}
                            onPress={toggleFlash}
                        >
                            <Text style={styles.controlText}>
                                {flashMode === Camera.Constants.FlashMode.torch ? '🔦 Off' : '🔦 On'}
                            </Text>
                        </TouchableOpacity>
                        
                        {scanned && (
                            <TouchableOpacity 
                                style={styles.controlButton}
                                onPress={() => setScanned(false)}
                            >
                                <Text style={styles.controlText}>Scan Again</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Camera>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#FFE4B5',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    cornerTL: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 20,
        height: 20,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#FFE4B5',
    },
    cornerTR: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 20,
        height: 20,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#FFE4B5',
    },
    cornerBL: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 20,
        height: 20,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#FFE4B5',
    },
    cornerBR: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#FFE4B5',
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 20,
    },
    controlButton: {
        backgroundColor: '#000000',
        padding: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FFE4B5',
    },
    controlText: {
        color: '#FFE4B5',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QRScanner; 