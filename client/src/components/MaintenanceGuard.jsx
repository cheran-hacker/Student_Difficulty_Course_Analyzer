import { useState, useEffect } from 'react';
import axios from 'axios';
import MaintenancePage from '../pages/MaintenancePage';
import { API_ENDPOINTS } from '../config/api';

const MaintenanceGuard = ({ children }) => {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data } = await axios.get(API_ENDPOINTS.SETTINGS);
                setIsMaintenance(data.isMaintenanceMode);
            } catch (error) {
                console.error('Failed to check system status', error);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();

        // Optional: Poll every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null; // Or a spinner

    // Allow Admins to bypass
    if (isMaintenance && userInfo?.role !== 'admin') {
        return <MaintenancePage />;
    }

    return children;
};

export default MaintenanceGuard;
