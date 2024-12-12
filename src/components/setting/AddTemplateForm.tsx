import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import '../../css/Admins/AddTemplateForm.css';

interface Template {
    name: string;
    language: 'es' | 'en';
    category: 'MARKETING' | 'SUPPORT' | 'SALES';
    components: Component[];
}

interface Component {
    type: 'BODY' | 'HEADER' | 'FOOTER';
    text: string;
    example: {
        body_text: string[][];
    };
}

interface AddTemplateFormProps {
    socket: Socket | null;
    isOpen: boolean;
    onClose: () => void;
}

const AddTemplateForm: React.FC<AddTemplateFormProps> = ({ socket, isOpen, onClose }) => {
    const [template, setTemplate] = useState<Template>({
        name: '',
        language: 'es',
        category: 'MARKETING',
        components: [
            {
                type: 'BODY',
                text: '',
                example: {
                    body_text: [[]]
                }
            }
        ]
    });

    const [examples, setExamples] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket) return;

        const exampleValues = examples.split(',').map(ex => ex.trim()).filter(ex => ex);
        if (exampleValues.length === 0) {
            alert('Please add at least one example');
            return;
        }

        const variableCount = (template.components[0].text.match(/{{(\d+)}}/g) || []).length;

        const formattedExamples = exampleValues.map(example => {
            const values = example.split('|').map(v => v.trim());
            return values.length === variableCount ? values : new Array(variableCount).fill('');
        });

        const formattedName = template.name.toLowerCase().replace(/\s+/g, '_');
        const updatedTemplate = {
            ...template,
            name: formattedName,
            components: [
                {
                    ...template.components[0],
                    example: {
                        body_text: formattedExamples
                    }
                }
            ]
        };

        socket.emit('uploadTemplate', updatedTemplate);

        onClose();
    };

    const handleTextChange = (text: string) => {
        setTemplate(prev => ({
            ...prev,
            components: [
                {
                    ...prev.components[0],
                    text,
                    example: {
                        body_text: [[]]
                    }
                }
            ]
        }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTemplate(prev => ({
            ...prev,
            name: e.target.value.trim()
        }));
    };

    return (
        <div className="add-template-form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="templateName" className="form-label">
                        Template Name
                    </label>
                    <input
                        id="templateName"
                        className="form-input"
                        type="text"
                        value={template.name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="form-field">
                        <label className="form-label">Language</label>
                        <input
                            className="form-input"
                            type="text"
                            value={template.language === 'es' ? 'Español' : 'English'}
                            disabled
                        />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Category</label>
                        <input
                            className="form-input"
                            type="text"
                            value={template.category}
                            disabled
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="messageContent" className="form-label">
                        Message Content
                    </label>
                    <textarea
                        id="messageContent"
                        className="form-textarea"
                        value={template.components[0].text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Use {{1}}, {{2}}, etc. for variables"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Examples (separate variables with | and examples with commas)</label>
                    <input
                        className="form-input"
                        type="text"
                        value={examples}
                        onChange={(e) => setExamples(e.target.value)}
                        placeholder="Juan|Ingeniería"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={!socket}>
                        Create Template
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTemplateForm;