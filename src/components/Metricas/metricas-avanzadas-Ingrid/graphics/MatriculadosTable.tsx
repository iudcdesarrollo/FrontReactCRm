import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import '../../../../css/metricas/TableMatriculados.css';
import { PaginationInfo, Profesional, ProfesionalesTableProps, TableResponse } from './types';

const ProfesionalesTable: React.FC<ProfesionalesTableProps> = ({ onRowClick }) => {
    const [data, setData] = useState<Profesional[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [tipoFiltro, setTipoFiltro] = useState<string>('todos');

    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy,
                sortOrder,
                ...(searchTerm && { search: searchTerm }),
                ...(tipoFiltro !== 'todos' && { tipo: tipoFiltro })
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_URL_GENERAL}/matriculados?${queryParams}`
            );
            const result: TableResponse = await response.json();

            if (result.success) {
                setData(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, sortBy, sortOrder, tipoFiltro]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (pagination.page !== 1) {
                setPagination(prev => ({ ...prev, page: 1 }));
            } else {
                fetchData();
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const renderPagination = () => {
        const currentPage = pagination.page;
        const totalPages = pagination.totalPages;

        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        const pages = [];

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Anterior
                </button>
                <div className="pagination-numbers">
                    {pages.map((page, index) => (
                        typeof page === 'number' ? (
                            <button
                                key={index}
                                onClick={() => handlePageChange(page)}
                                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={index} className="pagination-ellipsis">{page}</span>
                        )
                    ))}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Siguiente
                </button>
            </div>
        );
    };

    const renderBoolean = (value: boolean) => {
        return value ? (
            <CheckCircle className="icon-check" />
        ) : (
            <XCircle className="icon-x" />
        );
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="table-container">
            <div className="table-toolbar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, documento o programa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className="filter-select"
                >
                    <option value="todos">Todos</option>
                    <option value="profesional">Profesional</option>
                    <option value="tecnico">Técnico</option>
                    <option value="especializacion">Especialización</option>
                    <option value="homologacion">Homologación</option>
                </select>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('nombre1')} className="sortable-header">
                                Nombres
                                {sortBy === 'nombre1' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                            <th onClick={() => handleSort('apellido1')} className="sortable-header">
                                Apellidos
                                {sortBy === 'apellido1' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                            <th onClick={() => handleSort('numeroIdentificacion')} className="sortable-header">
                                Documento
                                {sortBy === 'numeroIdentificacion' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                            <th onClick={() => handleSort('programa')} className="sortable-header">
                                Programa
                                {sortBy === 'programa' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                            <th onClick={() => handleSort('periodoAcademico')} className="sortable-header">
                                Periodo
                                {sortBy === 'periodoAcademico' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                            <th>Estado</th>
                            <th>Documentos</th>
                            <th onClick={() => handleSort('numeroContacto')} className="sortable-header">
                                Teléfono
                                {sortBy === 'numeroContacto' && (
                                    sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((profesional, index) => (
                            <tr
                                key={index}
                                className={`table-row ${selectedRow === index ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedRow(index);
                                    onRowClick?.(profesional);
                                }}
                            >
                                <td>{profesional.nombre1} {profesional.nombre2}</td>
                                <td>{profesional.apellido1} {profesional.apellido2}</td>
                                <td className="text-mono">{profesional.numeroIdentificacion}</td>
                                <td>{profesional.programa}</td>
                                <td>{profesional.periodoAcademico}</td>
                                <td>
                                    <div className="status-badges">
                                        {profesional.profesional && (
                                            <span className="badge professional">Profesional</span>
                                        )}
                                        {profesional.tecnico && (
                                            <span className="badge technical">Técnico</span>
                                        )}
                                        {profesional.especializacion && (
                                            <span className="badge specialization">Especialización</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="document-icons">
                                        <div className="document-icon" title="Diploma/Acta">
                                            {renderBoolean(profesional.diplomaActa)}
                                        </div>
                                        <div className="document-icon" title="Documento de Identidad">
                                            {renderBoolean(profesional.copiaDocumentoIdentidad)}
                                        </div>
                                        <div className="document-icon" title="Certificado EPS">
                                            {renderBoolean(profesional.certificadoEps)}
                                        </div>
                                    </div>
                                </td>
                                <td className="phone-column">{profesional.numeroContacto}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {renderPagination()}
        </div>
    );
};

export default ProfesionalesTable;