import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir el problema de los íconos en React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

interface City {
    name: string;
    lat: number;
    lng: number;
    sales: number;
}

const cities: City[] = [
    { name: 'Bogotá', lat: 4.7110, lng: -74.0721, sales: 1250000 },
    { name: 'Medellín', lat: 6.2442, lng: -75.5812, sales: 980000 },
    { name: 'Cali', lat: 3.4516, lng: -76.5320, sales: 850000 },
    { name: 'Barranquilla', lat: 10.9685, lng: -74.7813, sales: 620000 },
    { name: 'Cartagena', lat: 10.3932, lng: -75.4832, sales: 580000 },
    { name: 'Bucaramanga', lat: 7.1254, lng: -73.1198, sales: 450000 },
    { name: 'Pereira', lat: 4.8133, lng: -75.6961, sales: 320000 },
    { name: 'Santa Marta', lat: 11.2404, lng: -74.1990, sales: 290000 },
    { name: 'Manizales', lat: 5.0687, lng: -75.5173, sales: 280000 },
    { name: 'Ibagué', lat: 4.4389, lng: -75.2322, sales: 260000 }
];

const customIcon = (sales: number) => {
    const size = Math.min(30, Math.max(20, sales / 50000));
    return L.divIcon({
        html: `<div style="
            background-color: #3B82F6;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.4);
        "></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const ColombiaMap: React.FC = () => {
    return (
        <MapContainer
            center={[4.5709, -74.2973]}
            zoom={6}
            style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {cities.map((city) => (
                <Marker
                    key={city.name}
                    position={[city.lat, city.lng]}
                    icon={customIcon(city.sales)}
                >
                    <Popup>
                        <div className="p-2 text-center">
                            <h3 className="font-semibold text-gray-800">{city.name}</h3>
                            <p className="text-gray-600">Ventas: ${city.sales.toLocaleString()}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ColombiaMap;