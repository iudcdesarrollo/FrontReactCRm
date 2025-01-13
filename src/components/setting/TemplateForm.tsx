import axios, { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import '../../css/Admins/TemplateForm.css'

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
}

const cleanTemplateText = (text: string): string => {
    if (!text) return '';

    return text
        .replace(/[•●■◆]/g, '-')
        .replace(/\n\s*\n/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/ {4,}/g, '   ')
        .trim();
};

const TemplateForm: React.FC<TemplateFormProps> = ({ socket, to }) => {
    const [templateName, setTemplateName] = useState<string>('');
    const [language] = useState<string>('es');
    const [components, setComponents] = useState<TemplateComponent[]>([]);
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [templateText, setTemplateText] = useState<string>('');

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
            const cleanComponents = components.map(comp => ({
                ...comp,
                text: cleanTemplateText(comp.text)
            }));

            const templateData: TemplateData = {
                to,
                templateName,
                language,
                templateText: templateText ? cleanTemplateText(templateText) : undefined,
                components: [{
                    type: 'body',
                    parameters: cleanComponents.map(comp => ({
                        type: 'text',
                        text: comp.text
                    }))
                }]
            };

            socket.emit('sendTemplate', templateData);

            setMessage('Template enviado correctamente');
            setError('');

            socket.on('error', (data: { message: string, error: string }) => {
                console.error('Error en el envío del template:', data);
                setError(`${data.message}: ${data.error}`);
            });
        } else {
            setError('No se pudo establecer la conexión con el servidor');
        }
    };

    const handleComponentChange = (index: number, value: string) => {
        const cleanedValue = cleanTemplateText(value);
        const updatedComponents = [...components];
        updatedComponents[index] = { text: cleanedValue };
        setComponents(updatedComponents);
    };

    const handleTemplateChange = (template: Template): void => {
        setTemplateName(template.name);
        setTemplateText(template.components[0].text);

        const variableRegex = /\{\{(\d+)\}\}/g;
        const newComponents: TemplateComponent[] = [];

        template.components.forEach((component) => {
            while (variableRegex.exec(component.text) !== null) {
                newComponents.push({ text: '' });
            }
        });

        setComponents(newComponents);
    };

    const areAllComponentsFilled = () => {
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

                {components.map((component, index) => (
                    <div key={index} className="component-input">
                        <input
                            type="text"
                            value={component.text}
                            onChange={(e) => handleComponentChange(index, e.target.value)}
                            placeholder={`Variable ${index + 1}`}
                        />
                    </div>
                ))}

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