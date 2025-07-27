// Dummy implementation of react-native-maps for web platform
import React from 'react';

const MapView = ({ children, style, ...props }) => (
  <div style={{ 
    ...style, 
    backgroundColor: '#f0f0f0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '300px',
    borderRadius: '8px'
  }}>
    <div style={{ textAlign: 'center', color: '#666' }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>🗺️</div>
      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Map View</div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>Maps not available on web</div>
    </div>
    {children}
  </div>
);

const Marker = ({ children, ...props }) => <div>{children}</div>;

const Callout = ({ children, ...props }) => <div>{children}</div>;

// Export as default and named exports
export default MapView;
export { MapView, Marker, Callout }; 