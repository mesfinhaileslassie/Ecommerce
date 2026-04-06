import React, { useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaCrosshairs } from 'react-icons/fa';
import toast from 'react-hot-toast';  // Add this import

const LocationMap = ({ onLocationSelect, initialAddress, initialCity }) => {
    const [address, setAddress] = useState(initialAddress || '');
    const [city, setCity] = useState(initialCity || '');
    const [mapSrc, setMapSrc] = useState(
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31464.410331026953!2d39.5329975843847!3d9.676658813141175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1649bd98a70be815%3A0xf607fe72734ef36d!2sDebre%20Birhan!5e0!3m2!1sen!2set!4v1775494411548!5m2!1sen!2set'
    );
    const [showMap, setShowMap] = useState(false);

    // Common Ethiopian city coordinates
    const cityCoordinates = {
        'Addis Ababa': '9.0320,38.7469',
        'Debre Birhan': '9.6767,39.5330',
        'Adama': '8.5400,39.2700',
        'Bahir Dar': '11.6000,37.3833',
        'Gondar': '12.6000,37.4667',
        'Hawassa': '7.0500,38.4667',
        'Jimma': '7.6667,36.8333',
        'Mekelle': '13.5000,39.4667',
        'Dire Dawa': '9.6000,41.8667',
        'Harar': '9.3167,42.1167'
    };

    const generateMapUrl = (cityName, addressLine) => {
        let query = cityName;
        if (addressLine && addressLine !== cityName) {
            query = `${addressLine}, ${cityName}`;
        }
        const encodedQuery = encodeURIComponent(query);
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBkIYH0LzYtN3Q5sZ7m8v1n2x3y4z5a6b7c8d&q=${encodedQuery}`;
    };

    const handleCityChange = (selectedCity) => {
        setCity(selectedCity);
        const coords = cityCoordinates[selectedCity];
        if (coords) {
            const [lat, lng] = coords.split(',');
            const newMapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31464.410331026953!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1649bd98a70be815%3A0xf607fe72734ef36d!2s${encodeURIComponent(selectedCity)}!5e0!3m2!1sen!2set!4v1775494411548!5m2!1sen!2set`;
            setMapSrc(newMapSrc);
            setShowMap(true);
            if (onLocationSelect) {
                onLocationSelect({ city: selectedCity, coordinates: coords });
            }
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newMapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31464.410331026953!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1649bd98a70be815%3A0xf607fe72734ef36d!2s${latitude},${longitude}!5e0!3m2!1sen!2set!4v1775494411548!5m2!1sen!2set`;
                    setMapSrc(newMapSrc);
                    setShowMap(true);
                    if (onLocationSelect) {
                        onLocationSelect({ latitude, longitude, isCurrent: true });
                    }
                    toast.success('Location updated to your current position');
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Unable to get your location. Please select manually.');
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    const handleAddressUpdate = () => {
        if (address || city) {
            setShowMap(true);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <FaMapMarkerAlt style={styles.icon} />
                <h3 style={styles.title}>Delivery Location</h3>
            </div>

            <div style={styles.searchSection}>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={handleAddressUpdate} style={styles.searchBtn}>
                        <FaSearch /> Show Map
                    </button>
                </div>

                <div style={styles.citySelector}>
                    <label style={styles.label}>Or select a city:</label>
                    <select 
                        onChange={(e) => handleCityChange(e.target.value)}
                        value={city}
                        style={styles.select}
                    >
                        <option value="" disabled>Select your city</option>
                        {Object.keys(cityCoordinates).map(cityName => (
                            <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleUseCurrentLocation} style={styles.currentLocationBtn}>
                    <FaCrosshairs /> Use My Current Location
                </button>
            </div>

            {showMap && (
                <div style={styles.mapContainer}>
                    <iframe
                        title="Location Map"
                        src={mapSrc}
                        width="100%"
                        height="300"
                        style={styles.map}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                    <p style={styles.mapHint}>
                        <FaMapMarkerAlt size={12} /> Drag the map to adjust or zoom in/out
                    </p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #f0f0f0',
    },
    icon: {
        fontSize: '1.2rem',
        color: '#6366f1',
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: '600',
        margin: 0,
        color: '#333',
    },
    searchSection: {
        marginBottom: '1rem',
    },
    inputGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    input: {
        flex: 1,
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
    },
    searchBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1rem',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    citySelector: {
        marginBottom: '0.75rem',
    },
    label: {
        display: 'block',
        fontSize: '0.8rem',
        marginBottom: '0.25rem',
        color: '#666',
    },
    select: {
        width: '100%',
        padding: '0.6rem',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        backgroundColor: '#fff',
    },
    currentLocationBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.6rem',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    mapContainer: {
        marginTop: '1rem',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
    },
    map: {
        border: 0,
        width: '100%',
        height: '300px',
    },
    mapHint: {
        fontSize: '0.7rem',
        color: '#999',
        textAlign: 'center',
        padding: '0.5rem',
        margin: 0,
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
    },
};

export default LocationMap;