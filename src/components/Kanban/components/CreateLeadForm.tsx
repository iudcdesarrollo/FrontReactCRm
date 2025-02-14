import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import '../css/CreateLeadForm.css';

interface Agent {
    agente: string;
    correo: string;
}

interface MetricsResponse {
    success: boolean;
    data: MetricsData[];
}

interface MetricsData {
    agente: string;
    correo: string;
    total: number;
    sinGestionar: number;
    conversacion: number;
    depuracion: number;
    llamada: number;
    segundaLlamada: number;
    inscrito: number;
    ventaPerdida: number;
    metricsByTime: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

interface LeadFormData {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    programa: string;
    agente: {
        nombre: string;
        correo: string;
    };
}

interface CreateLeadFormProps {
    tipoGestion: string;
    onSubmit: (data: LeadFormData) => void;
    onCancel: () => void;
}

const CreateLeadForm = ({ tipoGestion, onSubmit, onCancel }: CreateLeadFormProps) => {
    const [formData, setFormData] = useState<LeadFormData>({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        programa: '',
        agente: {
            nombre: '',
            correo: ''
        }
    });

    const [agentes, setAgentes] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAgentes = async () => {
            try {
                const response = await axios.get<MetricsResponse>(`${import.meta.env.VITE_API_URL_GENERAL}/metricas`);
                if (response.data.success && Array.isArray(response.data.data)) {
                    setAgentes(response.data.data.map((item: MetricsData) => ({
                        agente: item.agente,
                        correo: item.correo
                    })));
                }
                setLoading(false);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Error al cargar los agentes';
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchAgentes();
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            programa: '',
            agente: {
                nombre: '',
                correo: ''
            }
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "agente") {
            const selectedAgent = agentes.find(agent => agent.agente === value);
            if (selectedAgent) {
                setFormData(prev => ({
                    ...prev,
                    agente: {
                        nombre: selectedAgent.agente,
                        correo: selectedAgent.correo
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    if (loading) {
        return <div className="lead-form-container">Cargando agentes...</div>;
    }

    if (error) {
        return <div className="lead-form-container">Error: {error}</div>;
    }

    return (
        <div className="lead-form-container">
            <div className="lead-form-card">
                <h2 className="lead-form-title">Nuevo Lead - {tipoGestion}</h2>
                <form onSubmit={handleSubmit} className="lead-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Juan"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                value={formData.apellido}
                                onChange={handleChange}
                                placeholder="Pérez"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="correo">Correo</label>
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="juan@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="573102457842"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="programa">Programa</label>
                            <input
                                id="programa"
                                name="programa"
                                type="text"
                                value={formData.programa}
                                onChange={handleChange}
                                placeholder="Nombre del programa"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="agente">Agente</label>
                            <select
                                id="agente"
                                name="agente"
                                value={formData.agente.nombre}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un agente</option>
                                {agentes.map((agente) => (
                                    <option
                                        key={agente.correo}
                                        value={agente.agente}
                                    >
                                        {agente.agente}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-submit">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLeadForm;