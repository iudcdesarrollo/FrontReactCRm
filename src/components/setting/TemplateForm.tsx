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
    components: { type: string; parameters: { type: string; text: string }[] }[];
}

interface TemplateFormProps {
    socket: Socket | null;
    to: string;
}

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
            const templateData: TemplateData = { to, templateName, language, components: [{ type: 'body', parameters: components.map(comp => ({ type: 'text', text: comp.text })) }] };
            socket.emit('sendTemplate', templateData);

            setMessage('');
            setError('');
            socket.on('templateSent', (data: { message: string }) => setMessage(data.message));
            socket.on('error', (data: { message: string, error: string }) => setError(`${data.message}: ${data.error}`));
        } else {
            setError('No se pudo establecer la conexión con el servidor');
        }
    };

    const handleComponentChange = (index: number, value: string) => {
        const updatedComponents = [...components];
        updatedComponents[index] = { text: value };
        setComponents(updatedComponents);
    };

    const handleTemplateChange = (template: Template): void => {
        setTemplateName(template.name);
        setTemplateText(template.components[0].text);

        console.log(template.name);
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
                        >
                            {template.name}
                        </button>
                    ))}
                </div>

                {templateText && (
                    <div className="template-text" style={{ color: 'black' }}>
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
                            style={{ color: 'white' }}
                        />
                    </div>
                ))}

                <button type="submit" className="submit-btn" disabled={!areAllComponentsFilled()} style={{ color: 'black' }}>Enviar</button>
            </form>

            {message && <div className="success-message" style={{ color: 'black' }}>{message}</div>}
            {error && <div className="error-message" style={{ color: 'black' }}>{error}</div>}
        </div>
    );
};

export default TemplateForm;