import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Bogotá': { lat: 4.7110, lng: -74.0721 },
    'Medellín': { lat: 6.2442, lng: -75.5812 },
    'Cali': { lat: 3.4516, lng: -76.5320 },
    'Barranquilla': { lat: 10.9685, lng: -74.7813 },
    'Cartagena': { lat: 10.3932, lng: -75.4832 },
    'Cúcuta': { lat: 7.8890, lng: -72.4970 },
    'Bucaramanga': { lat: 7.1254, lng: -73.1198 },
    'Pereira': { lat: 4.8133, lng: -75.6961 },
    'Santa Marta': { lat: 11.2404, lng: -74.1990 },
    'Ibagué': { lat: 4.4389, lng: -75.2322 },
    'Pasto': { lat: 1.2136, lng: -77.2811 },
    'Manizales': { lat: 5.0687, lng: -75.5173 },
    'Neiva': { lat: 2.9273, lng: -75.2819 },
    'Villavicencio': { lat: 4.1533, lng: -73.6350 },
    'Armenia': { lat: 4.5389, lng: -75.6725 },
    'Valledupar': { lat: 10.4631, lng: -73.2532 },
    'Montería': { lat: 8.7489, lng: -75.8828 },
    'Sincelejo': { lat: 9.3047, lng: -75.3977 },
    'Popayán': { lat: 2.4448, lng: -76.6147 },
    'Tunja': { lat: 5.5446, lng: -73.3572 },
    'Riohacha': { lat: 11.5444, lng: -72.9072 },
    'Quibdó': { lat: 5.6919, lng: -76.6583 },
    'Florencia': { lat: 1.6146, lng: -75.6116 },
    'Yopal': { lat: 5.3389, lng: -72.3967 },
    'Mocoa': { lat: 1.1519, lng: -76.6483 },
    'San José del Guaviare': { lat: 2.5709, lng: -72.6420 },
    'Mitú': { lat: 1.2537, lng: -70.2337 },
    'Puerto Carreño': { lat: 6.1891, lng: -67.4930 },
    'Inírida': { lat: 3.8653, lng: -67.9239 },
    'Leticia': { lat: -4.2159, lng: -69.9406 },
    'No especificada': { lat: 4.5709, lng: -74.2973 }
};

interface CityData {
    ciudad: string;
    cantidad: number;
}

const customIcon = (count: number) => {
    const size = Math.min(30, Math.max(20, count * 5));
    return L.divIcon({
        html: `<div style="
            background-color: #3B82F6;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${size / 2}px;
        ">${count}</div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

const ColombiaMap: React.FC = () => {
    const [citiesData, setCitiesData] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/lost-sales`);
                if (!response.ok) throw new Error('Error al cargar los datos');
                const data = await response.json();
                if (data.success) {
                    const filteredData = data.data.filter((city: CityData) =>
                        city.ciudad !== 'Bogotá' && city.ciudad !== 'No especificada'
                    );
                    setCitiesData(filteredData);
                } else {
                    throw new Error(data.message || 'Error desconocido');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-600">Cargando mapa...</span>
    </div>;

    if (error) return <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-600">{error}</span>
    </div>;

    return (
        <MapContainer
            center={[4.5709, -74.2973]}
            zoom={6}
            className="h-full w-full rounded-md"
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {citiesData.map((cityData) => {
                const coordinates = cityCoordinates[cityData.ciudad];
                if (!coordinates) return null;

                return (
                    <Marker
                        key={cityData.ciudad}
                        position={[coordinates.lat, coordinates.lng]}
                        icon={customIcon(cityData.cantidad)}
                    />
                );
            })}
        </MapContainer>
    );
};

export default ColombiaMap;