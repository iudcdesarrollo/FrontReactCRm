import React, { useState } from 'react';
import { Search, Filter, Edit3, Check } from 'lucide-react';
import '../../../css/Admins/campañas/CampaignTable.css';

interface Campaign {
    estado: boolean;
    titulo: string;
    tipoDeTarea: string;
    campana: string;
    fechaVencimiento: string;
}

type SubTab = 'Todos' | 'Vencen hoy' | 'Atrasado' | 'Completadas';

const CampaignTable = (): JSX.Element => {
    const [selectedSubTab, setSelectedSubTab] = useState<SubTab>('Todos');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const campaigns: Campaign[] = [
        {
            estado: true,
            titulo: 'Update co-marketing team p...',
            tipoDeTarea: '--',
            campana: 'Biglytics Ebook - Compe...',
            fechaVencimiento: '12 de abril de 2021'
        },
        {
            estado: true,
            titulo: 'Review Campaign copy with...',
            tipoDeTarea: '--',
            campana: '--',
            fechaVencimiento: '22 de abril de 2021'
        },
        {
            estado: true,
            titulo: 'Add social Images',
            tipoDeTarea: 'Publicación de...',
            campana: 'Biglytics Ebook - Compe...',
            fechaVencimiento: '30 de abril de 2021'
        },
        {
            estado: true,
            titulo: 'Review impact of campaign...',
            tipoDeTarea: '--',
            campana: 'Biglytics Ebook - Compe...',
            fechaVencimiento: '19 de mayo de 2021'
        },
        {
            estado: true,
            titulo: 'Close out form submissions',
            tipoDeTarea: '--',
            campana: 'Biglytics Ebook - Compe...',
            fechaVencimiento: '31 de mayo de 2021'
        }
    ];

    const handleSubTabChange = (tab: SubTab) => {
        setSelectedSubTab(tab);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const tabButtons: Array<{ id: SubTab; label: string }> = [
        { id: 'Todos', label: 'Todos (5)' },
        { id: 'Vencen hoy', label: 'Vencen hoy' },
        { id: 'Atrasado', label: 'Atrasado' },
        { id: 'Completadas', label: 'Completadas' }
    ];

    return (
        <div className="campaign-wrapper">
            <div className="filter-section">
                <div className="flex items-center gap-4">
                    {tabButtons.map(({ id, label }) => (
                        <button
                            key={id}
                            className={`nav-item ${selectedSubTab === id ? 'active' : ''}`}
                            onClick={() => handleSubTabChange(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="controls-bar">
                <div className="flex items-center gap-4">
                    <div className="search-box">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar"
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="filter-button">
                        <Filter size={20} />
                        Filtro
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="action-button secondary">
                        <Edit3 size={20} />
                        Editar columnas
                    </button>
                    <button className="action-button primary">
                        Crear tarea
                    </button>
                </div>
            </div>
            <div className="table-container">
                <table className="campaign-table">
                    <thead>
                        <tr>
                            <th>
                                <div className="checkbox-wrapper">
                                    <input type="checkbox" className="checkbox-input" />
                                </div>
                            </th>
                            <th>ESTADO</th>
                            <th>TÍTULO</th>
                            <th>TIPO DE TAREA</th>
                            <th>CAMPAÑA</th>
                            <th>FECHA DE VENCIMIENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="checkbox-wrapper">
                                        <input type="checkbox" className="checkbox-input" />
                                    </div>
                                </td>
                                <td>
                                    <div className="status-circle">
                                        <Check className="text-white" size={16} />
                                    </div>
                                </td>
                                <td>
                                    <a href="#" className="title-link">{campaign.titulo}</a>
                                </td>
                                <td>{campaign.tipoDeTarea}</td>
                                <td>{campaign.campana}</td>
                                <td className="due-date">{campaign.fechaVencimiento}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-bar">
                <div className="pagination-controls">
                    <button className="page-button">Anterior</button>
                    <button className="page-button active">1</button>
                    <button className="page-button">Siguiente</button>
                </div>
                <select className="page-size-select">
                    <option>25 por página</option>
                </select>
            </div>
        </div>
    );
};

export default CampaignTable;