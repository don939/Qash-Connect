import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    ScrollView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import QRScanner from './screens/QRScanner';

const Stack = createStackNavigator();

// Loading Component
const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading Qash Connect...</Text>
    </View>
);

// Hero Section Component
const HeroSection = ({ navigation }) => (
    <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Welcome to Qash Connect</Text>
        <Text style={styles.heroSubtitle}>Choose your role below</Text>
        
        <View style={styles.optionsContainer}>
            <TouchableOpacity 
                style={styles.optionCard}
                onPress={() => navigation.navigate('CashAtHand')}
            >
                <Text style={styles.optionTitle}>Cash at Hand</Text>
                <Text style={styles.optionText}>I need to transfer cash</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.optionCard}
                onPress={() => navigation.navigate('CashToGive')}
            >
                <Text style={styles.optionTitle}>Cash to Give</Text>
                <Text style={styles.optionText}>I can provide cash</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Main App Component
const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initialization
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    if (isLoading) {
        return <LoadingOverlay />;
    }

    return (
        <NavigationContainer>
            <StatusBar backgroundColor="#FFE4B5" barStyle="dark-content" />
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#FFE4B5',
                        borderBottomWidth: 2,
                        borderBottomColor: '#000000',
                    },
                    headerTintColor: '#000000',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen 
                    name="Home" 
                    component={HeroSection}
                    options={{ title: 'Qash Connect' }}
                />
                <Stack.Screen
                    name="QRScanner"
                    component={QRScanner}
                    options={{
                        title: 'Scan QR Code',
                        headerStyle: {
                            backgroundColor: '#000000',
                        },
                        headerTintColor: '#FFE4B5',
                    }}
                />
                {/* Add other screens here */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 228, 181, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#000000',
        fontSize: 16,
    },
    heroSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 30,
    },
    optionsContainer: {
        width: '100%',
        flexDirection: 'column',
        gap: 20,
    },
    optionCard: {
        backgroundColor: '#FFE4B5',
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#000000',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 5,
    },
    optionText: {
        fontSize: 14,
        color: '#000000',
    },
});

export default App; 