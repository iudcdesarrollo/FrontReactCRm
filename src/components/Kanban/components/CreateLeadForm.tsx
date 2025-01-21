import { useState, ChangeEvent, FormEvent } from 'react';
import '../css/CreateLeadForm.css';
import { LeadFormData } from '../@types/kanban';

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
        programa: ''
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            nombre: '',
            apellido: '',
            correo: '',
            telefono: '',
            programa: ''
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

                        <div className="form-group full-width">
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