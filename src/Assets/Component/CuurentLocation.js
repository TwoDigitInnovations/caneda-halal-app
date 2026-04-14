/* eslint-disable prettier/prettier */
import Geolocation from '@react-native-community/geolocation';

const CuurentLocation = async getLocation => {
    try {
        return Geolocation.getCurrentPosition(
            location => {
                getLocation(location);
            },
            error => {
                console.warn(error.code, error.message);
            },
            {enableHighAccuracy: false, timeout: 30000, maximumAge: 60000},
        );
    } catch (error) {
        const { code, message } = error;
        console.warn(code, message);
    }
};

export default CuurentLocation;
