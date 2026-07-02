import React, { useState, useEffect, useRef, useCallback } from 'react';

const DriverTracker = ({ socket, bookingId, userId }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [error, setError] = useState('');
  const watchIdRef = useRef(null);

  const goOnline = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError('');

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        const pos = { lat, lng, accuracy };
        setCurrentPosition(pos);

        if (socket) {
          socket.emit('driverLocationUpdate', { bookingId, lat, lng, driverId: userId });
        }
      },
      (err) => {
        setError(`GPS Error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    watchIdRef.current = id;
    setIsOnline(true);
    
    if (socket && userId) {
      socket.emit('registerDriver', { driverId: userId });
    }
  }, [socket, bookingId, userId]);

  const goOffline = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (socket) {
      socket.emit('driverOffline', { driverId: userId });
    }

    setIsOnline(false);
  }, [socket]);

  const handleToggle = () => {
    if (isOnline) {
      goOffline();
    } else {
      goOnline();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="relative">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            {isOnline && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </div>
          <span className="text-white font-semibold">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          className={`px-5 py-2 rounded-full text-sm font-semibold text-white transition-all ${
            isOnline
              ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Current coordinates */}
      {currentPosition && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Latitude</span>
            <span className="text-white font-mono">{currentPosition.lat.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Longitude</span>
            <span className="text-white font-mono">{currentPosition.lng.toFixed(6)}</span>
          </div>
          {currentPosition.accuracy && (
            <div className="flex justify-between text-gray-300">
              <span>GPS Accuracy</span>
              <span className="text-white font-mono">{currentPosition.accuracy.toFixed(1)} m</span>
            </div>
          )}
        </div>
      )}

      {!currentPosition && isOnline && (
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Acquiring GPS signal...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DriverTracker;
