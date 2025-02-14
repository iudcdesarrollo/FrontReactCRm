import axios, { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import '../../css/Admins/TemplateForm.css';

interface Component {
    text: string;
}

interface Template {
    name: string;
    components: Component[];
    status: string;
    text: string;
}

interface TemplateComponent {
    text: string;
}

interface TemplateData {
    to: string;
    templateName: string;
    language: string;
    templateText?: string;
    components: { type: string; parameters: { type: string; text: string }[] }[];
}

interface TemplateFormProps {
    socket: Socket | null;
    to: string;
    NameAgent: string;
}

const TECHNICAL_PROGRAMS = [
    'Animación 2D y 3D',
    'Operaciones de software y redes de computo',
    'Aux. Productos interactivos digitales',
    'Aux. Contable y financiero',
    'Aux. Administrativo',
    'Aux. Enfermería',
    'Aux. Clínica veterinaria',
    'Aux. Talento Humano',
    'Seguridad ocupacional',
    'Cocina nacional e internacional',
    'Investigadores criminalísticos y judiciales',
    'Diseño, confección y mercadeo de modas',
    'Diseño Gráfico',
    'Centro de Idiomas'
];

const UNDERGRADUATE_PROGRAMS = [
    'Arquitectura',
    'Derecho',
    'Administración de Empresas',
    'Contaduría Pública',
    'Ingeniería Industrial',
    'Ingeniería de Sistemas',
    'Ingeniería de Software',
    'Psicología',
    'Medicina Veterinaria y Zootecnia',
    'Comunicación Social'
];

const GRADUATE_PROGRAMS = [
    'Esp. Derecho Penal y Criminalística',
    'Esp. Derecho Administrativo y Contractual',
    'Esp. Gerencia de Empresas',
    'Esp. Gerencia del Talento Humano',
    'Esp. Gerencia Financiera'
];

const WEEKEND_PROGRAMS = [
    'Psicología',
    'Ingeniería de Sistemas',
    'Ingeniería de Software',
    'Derecho',
    'Arquitectura',
    'Administración de Empresas'
];

const VIRTUAL_PROGRAMS = [
    'Derecho',
    'Arquitectura',
    'Ingeniería Industrial',
    'Ingeniería de Sistemas',
    'Ingeniería de Software',
    'Contaduría Pública',
    'Administración de Empresas',
    'Esp. Derecho Penal y Criminalística',
    'Esp. Derecho Administrativo y Contractual'
];

const formatNumber = (number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const TemplateForm: React.FC<TemplateFormProps> = ({ socket, to, NameAgent }) => {
    const [templateName, setTemplateName] = useState<string>('');
    const [language] = useState<string>('es');
    const [components, setComponents] = useState<TemplateComponent[]>([]);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [templateText, setTemplateText] = useState<string>('');
    const [selectedProgram, setSelectedProgram] = useState<string>('');
    const [selectedSchedule, setSelectedSchedule] = useState<string>('');

    const getProgramsList = () => {
        switch (templateName) {
            case 'programas_tecnicos_laborales':
                return TECHNICAL_PROGRAMS;
            case 'programas_profesionales':
                return UNDERGRADUATE_PROGRAMS;
            case 'especializaciones':
                return GRADUATE_PROGRAMS;
            default:
                return [];
        }
    };

    const getSchedulesList = () => {
        const schedules = ['Diurna', 'Nocturna'];
        if (WEEKEND_PROGRAMS.includes(selectedProgram)) {
            schedules.push('Fin de Semana');
        }
        if (VIRTUAL_PROGRAMS.includes(selectedProgram)) {
            schedules.push('Virtual');
        }
        return schedules;
    };

    const getProgramValues = (templateType: string, schedule: string, program: string) => {
        let values;
        switch (templateType) {
            case 'programas_tecnicos_laborales':
                values = { full: 1800000, installment: 600000 };
                break;
            case 'programas_profesionales':
                if (VIRTUAL_PROGRAMS.includes(program) && schedule === 'Virtual') {
                    values = { full: 2700000, installment: 900000 };
                } else {
                    values = { full: 3600000, installment: 1200000 };
                }
                break;
            case 'especializaciones':
                values = { full: 4650000, installment: 1550000 };
                break;
            default:
                values = { full: 0, installment: 0 };
        }
        return {
            full: values.full,
            installment: values.installment,
            formattedFull: formatNumber(values.full),
            formattedInstallment: formatNumber(values.installment)
        };
    };

    const updateComponents = (program: string, schedule: string) => {
        if (!program || !schedule) return;

        const values = getProgramValues(templateName, schedule, program);
        const updatedComponents = [
            { text: NameAgent },
            { text: program },
            { text: values.formattedFull },
            { text: values.formattedInstallment },
            { text: schedule }
        ];
        setComponents(updatedComponents);
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL_GENERAL}/templatesList`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                const approvedTemplates = response.data.filter((template: Template) => template.status === 'APPROVED');
                setTemplates(approvedTemplates);
            } catch (error) {
                const axiosError = error as AxiosError;
                setError(`Error al cargar los templates: ${axiosError.message}`);
            }
        };

        fetchTemplates();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateName || !language) {
            setError('Faltan datos requeridos');
            return;
        }

        if (socket) {
            let parameters;
            if (templateName === 'programas_tecnicos_laborales') {
                // Para templates técnicos, solo enviar nombre y programa
                parameters = [
                    { type: 'text', text: NameAgent },
                    { type: 'text', text: selectedProgram }
                ];
            } else if (['bienvenida', 'segundo_mensaje', 'saludopersonalizado', 'centro_de_idiomas'].includes(templateName)) {
                // Para templates que solo necesitan el nombre
                parameters = [{ type: 'text', text: NameAgent }];
            } else {
                // Para otros templates, enviar todos los componentes
                const currentValues = getProgramValues(templateName, selectedSchedule, selectedProgram);
                parameters = components.map((comp, index) => {
                    let text = comp.text;
                    if (index === 2) {
                        text = currentValues.formattedFull;
                    } else if (index === 3) {
                        text = currentValues.formattedInstallment;
                    }
                    return { type: 'text', text: sanitizeForWhatsApp(text) };
                });
            }

            const templateData: TemplateData = {
                to,
                templateName,
                language,
                templateText: templateText ? sanitizeForWhatsApp(templateText) : undefined,
                components: [{
                    type: 'body',
                    parameters
                }]
            };

            socket.emit('sendTemplate', templateData);
            setMessage('Template enviado correctamente');
            setError('');

            socket.off('error');
            socket.on('error', (data: { message: string, error: string }) => {
                console.error('Error en el envío del template:', data);
                setError(`${data.message}: ${data.error}`);
            });
        } else {
            setError('No se pudo establecer la conexión con el servidor');
        }
    };

    const handleTemplateChange = (template: Template): void => {
        setTemplateName(template.name);
        setTemplateText(template.components[0].text);
        setSelectedProgram('');
        setSelectedSchedule('');

        if (['bienvenida', 'segundo_mensaje', 'saludopersonalizado', 'centro_de_idiomas'].includes(template.name)) {
            setComponents([{ text: NameAgent }]);
        } else {
            setComponents([]);
        }
    };

    const handleProgramChange = (value: string) => {
        setSelectedProgram(value);
        setSelectedSchedule('');
    };

    const handleScheduleChange = (value: string) => {
        setSelectedSchedule(value);
        updateComponents(selectedProgram, value);
    };

    const sanitizeForWhatsApp = (text: string): string => {
        return text
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/ {4,}/g, '   ')
            .trim();
    };

    const areAllComponentsFilled = () => {
        if (['bienvenida', 'segundo_mensaje', 'saludopersonalizado'].includes(templateName)) {
            return components.length > 0;
        }
        return components.every(component => component.text.trim() !== '');
    };

    return (
        <div className="template-form" style={{ color: 'black' }}>
            <form onSubmit={handleSubmit}>
                <div className="template-selection">
                    {templates.map((template, index) => (
                        <button
                            type="button"
                            key={index}
                            onClick={() => handleTemplateChange(template)}
                            className={`template-button ${templateName === template.name ? 'active' : ''}`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>

                {templateText && (
                    <div className="template-text">
                        <p>{templateText}</p>
                    </div>
                )}

                {templateName && !['bienvenida', 'segundo_mensaje', 'saludopersonalizado', 'centro_de_idiomas'].includes(templateName) && (
                    <>
                        {/* Variable 1: Nombre del Agente */}
                        <div className="component-input">
                            <input
                                type="text"
                                value={NameAgent}
                                disabled
                                className="disabled-input"
                                placeholder="Variable 1 (Nombre del Agente)"
                            />
                        </div>

                        {/* Variable 2: Programa (como input disabled cuando está seleccionado) */}
                        <div className="component-input">
                            {selectedProgram && selectedSchedule ? (
                                <input
                                    type="text"
                                    value={selectedProgram}
                                    disabled
                                    className="disabled-input"
                                    placeholder="Variable 2 (Programa)"
                                />
                            ) : (
                                <select
                                    value={selectedProgram}
                                    onChange={(e) => handleProgramChange(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Seleccione programa</option>
                                    {getProgramsList().map((program) => (
                                        <option key={program} value={program}>
                                            {program}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Variables adicionales solo para templates que no son técnicos */}
                        {templateName !== 'programas_tecnicos_laborales' && (
                            <>
                                {/* Variable 3: Valor Total */}
                                {selectedProgram && selectedSchedule && (
                                    <div className="component-input">
                                        <input
                                            type="text"
                                            value={`$${getProgramValues(
                                                templateName,
                                                selectedSchedule,
                                                selectedProgram
                                            ).formattedFull}`}
                                            disabled
                                            className="disabled-input"
                                            placeholder="Variable 3 (Valor Total)"
                                        />
                                    </div>
                                )}

                                {/* Variable 4: Valor Cuota */}
                                {selectedProgram && selectedSchedule && (
                                    <div className="component-input">
                                        <input
                                            type="text"
                                            value={`$${getProgramValues(
                                                templateName,
                                                selectedSchedule,
                                                selectedProgram
                                            ).formattedInstallment}`}
                                            disabled
                                            className="disabled-input"
                                            placeholder="Variable 4 (Valor Cuota)"
                                        />
                                    </div>
                                )}

                                {/* Variable 5: Horario */}
                                <div className="component-input">
                                    {selectedProgram && !selectedSchedule ? (
                                        <select
                                            value={selectedSchedule}
                                            onChange={(e) => handleScheduleChange(e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="">Seleccione horario</option>
                                            {getSchedulesList().map((schedule) => (
                                                <option key={schedule} value={schedule}>
                                                    {schedule}
                                                </option>
                                            ))}
                                        </select>
                                    ) : selectedProgram && selectedSchedule && (
                                        <input
                                            type="text"
                                            value={selectedSchedule}
                                            disabled
                                            className="disabled-input"
                                            placeholder="Variable 5 (Horario)"
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

                {['bienvenida', 'segundo_mensaje', 'saludopersonalizado', 'centro_de_idiomas'].includes(templateName) && (
                    <div className="component-input">
                        <input
                            type="text"
                            value={NameAgent}
                            disabled
                            className="disabled-input"
                            placeholder="Variable 1"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={!areAllComponentsFilled()}
                >
                    Enviar
                </button>
            </form>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default TemplateForm;