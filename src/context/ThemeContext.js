import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSystemTheme, setIsSystemTheme] = useState(true);

    useEffect(() => {
        loadThemePreferences();
    }, []);

    useEffect(() => {
        if (isSystemTheme) {
            setIsDarkMode(systemColorScheme === 'dark');
        }
    }, [systemColorScheme, isSystemTheme]);

    const loadThemePreferences = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_preference');
            if (savedTheme) {
                setIsSystemTheme(false);
                setIsDarkMode(savedTheme === 'dark');
            } else {
                setIsSystemTheme(true);
                setIsDarkMode(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async (mode) => {
        try {
            if (mode === 'system') {
                setIsSystemTheme(true);
                setIsDarkMode(systemColorScheme === 'dark');
                await AsyncStorage.removeItem('theme_preference');
            } else {
                setIsSystemTheme(false);
                const newDarkMode = mode === 'dark';
                setIsDarkMode(newDarkMode);
                await AsyncStorage.setItem('theme_preference', newDarkMode ? 'dark' : 'light');
            }
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Dynamic colors based on theme
    const colors = {
        // Brand stays mostly the same but might need adjustment for contrast
        primary: isDarkMode ? '#AE6CC6' : '#9752A8',
        primaryGradient: isDarkMode
            ? ['#B070C6', '#4960C9', '#4E5DF2']
            : ['#9752A8', '#3C52AC', '#3D4AD4'],
        ordersGradient: ['#5B21B6', '#0F766E'], // Deepened Violet to Teal gradient for Orders Screen
        primaryLight: isDarkMode ? '#C084D1' : '#B06BC2',
        primaryDark: isDarkMode ? '#8E4B9B' : '#753B85',
        primaryExtraLight: isDarkMode ? '#D6A4E2' : '#E9D5FF',

        // Secondary colors
        secondary: isDarkMode ? '#6366F1' : '#4454EC',
        secondaryLight: isDarkMode ? '#818CF8' : '#6C41EC',
        secondaryDark: isDarkMode ? '#4F46E5' : '#3B58EB',

        // Accent colors
        accent: '#10B981',
        accentLight: isDarkMode ? '#34D399' : '#D1FAE5',
        accentWarning: '#F59E0B',
        accentInfo: '#3B82F6',

        // Backgrounds
        background: isDarkMode ? '#09090B' : '#FFFFFF', // Modern OLED black
        backgroundLight: isDarkMode ? '#18181B' : '#F8FAFC',
        backgroundDark: isDarkMode ? '#000000' : '#F1F5F9',

        // Surface/Cards
        card: isDarkMode ? '#18181B' : '#FFFFFF', // Elevated from background
        cardLight: isDarkMode ? '#27272A' : '#F8FAFC', // Slightly higher elevation
        surface: isDarkMode ? '#09090B' : '#FFFFFF',
        surface_container_lowest: isDarkMode ? '#09090B' : '#FFFFFF',
        surface_container_low: isDarkMode ? '#111113' : '#F8FAFC',
        surface_container: isDarkMode ? '#18181B' : '#F1F5F9',
        surface_container_high: isDarkMode ? '#222225' : '#E5E7EB',
        surface_container_highest: isDarkMode ? '#2C2C2E' : '#D1D5DB',

        // Text
        textPrimary: isDarkMode ? '#F9FAFB' : '#1F2937',
        textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280', // Brighter secondary text
        textLight: isDarkMode ? '#9CA3AF' : '#9CA3AF',
        textWhite: '#FFFFFF', // Always white
        on_surface: isDarkMode ? '#F9FAFB' : '#1F2937',
        on_surface_variant: isDarkMode ? '#D1D5DB' : '#6B7280',

        // Borders
        border: isDarkMode ? '#27272A' : '#E5E7EB',
        borderLight: isDarkMode ? '#1F1F23' : '#F3F4F6',
        divider: isDarkMode ? '#27272A' : '#E5E7EB',

        // Legacy mapping (to support existing components safely during transition)
        text: isDarkMode ? '#F9FAFB' : '#1F2937',
        white: isDarkMode ? '#09090B' : '#FFFFFF', // Map 'white' to background for full coverage
        black: isDarkMode ? '#F9FAFB' : '#000000',
        lightGray: isDarkMode ? '#18181B' : '#F5F5F5',
        darkGray: isDarkMode ? '#D1D5DB' : '#666666',

        // Status/Accent colors (keep generally the same or slightly saturated)
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    };

    const theme = {
        isDarkMode,
        isSystemTheme,
        toggleTheme,
        colors, // Pass dynamic colors
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
