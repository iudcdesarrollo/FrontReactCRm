import { useState } from 'react';
import { Map, Table } from 'lucide-react';
import ColombiaMap from './graphics/colombiaMap';
import LostSalesTable from './LostSalesTable';
import 'leaflet/dist/leaflet.css';
import { SearchBarTableMetricas } from '../searchMetricasTable';

const MapToggle = () => {
    const [vista, setVista] = useState('mapa');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="w-full relative">
            <div className="flex flex-col">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setVista('mapa')}
                                className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium transition-colors
                                ${vista === 'mapa' ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Map className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setVista('tabla')}
                                className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs font-medium transition-colors
                                ${vista === 'tabla' ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Table className="w-3 h-3" />
                            </button>
                        </div>

                        {vista === 'tabla' && (
                            <div className="relative flex items-center max-w-xs">
                                <SearchBarTableMetricas
                                    onSearch={handleSearch}
                                    placeholder="Buscar por ciudad, cliente..."
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                    <div style={{ height: '280px', width: '100%', position: 'relative' }}>
                        {vista === 'mapa' ? (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                                <ColombiaMap />
                            </div>
                        ) : (
                            <div className="w-full h-full overflow-auto">
                                <LostSalesTable searchQuery={searchQuery} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapToggle;