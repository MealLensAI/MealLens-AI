import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface SicknessSettings {
  hasSickness: boolean;
  sicknessType: string;
}

export const useSicknessSettings = () => {
  const [settings, setSettings] = useState<SicknessSettings>({
    hasSickness: false,
    sicknessType: ''
  });
  const [loading, setLoading] = useState(false);

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.getSicknessSettings();
        if (response.status === 'success' && response.settings) {
          setSettings({
            hasSickness: response.settings.hasSickness || false,
            sicknessType: response.settings.sicknessType || ''
          });
        }
      } catch (error) {
        console.error('Error loading sickness settings from backend:', error);
        // Fallback to localStorage if backend fails
        const savedSettings = localStorage.getItem('sicknessSettings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
          } catch (e) {
            console.error('Error parsing saved sickness settings:', e);
          }
        }
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<SicknessSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    // Keep localStorage as backup
    localStorage.setItem('sicknessSettings', JSON.stringify(updatedSettings));
  };

  const saveSettings = async (newSettings: SicknessSettings) => {
    setLoading(true);
    try {
      // Save to backend
      const response = await api.saveSicknessSettings(newSettings);
      
      if (response.status === 'success') {
        setSettings(newSettings);
        // Also save to localStorage as backup
        localStorage.setItem('sicknessSettings', JSON.stringify(newSettings));
        return { success: true };
      } else {
        console.error('Failed to save settings to backend:', response.message);
        // Fallback to localStorage only
        localStorage.setItem('sicknessSettings', JSON.stringify(newSettings));
        setSettings(newSettings);
        return { success: true, warning: 'Saved locally only - backend unavailable' };
      }
    } catch (error) {
      console.error('Error saving sickness settings:', error);
      // Fallback to localStorage only
      localStorage.setItem('sicknessSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return { success: true, warning: 'Saved locally only - backend unavailable' };
    } finally {
      setLoading(false);
    }
  };

  const getSicknessInfo = () => {
    if (!settings.hasSickness) {
      return null;
    }
    return {
      hasSickness: true,
      sicknessType: settings.sicknessType
    };
  };

  return {
    settings,
    loading,
    updateSettings,
    saveSettings,
    getSicknessInfo
  };
}; 