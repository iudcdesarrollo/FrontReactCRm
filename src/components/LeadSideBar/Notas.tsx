import React, { useState, useEffect } from 'react';
import './css/LeadNotes.css';

interface Note {
    content: string;
    timestamp: string;
}

interface LeadNotesProps {
    numeroWhatsapp: string;
}

const formatBogotaTime = (timestamp: string): string => {
    const date = new Date(timestamp);

    const bogotaTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

    return bogotaTime.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const LeadNotes: React.FC<LeadNotesProps> = ({ numeroWhatsapp }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [numeroWhatsapp]);

    const fetchNotes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/leads/${numeroWhatsapp}/notas`);
            if (!response.ok) throw new Error('Error fetching notes');
            const data = await response.json();
            const sortedNotes = data.notas.sort((a: { timestamp: string }, b: { timestamp: string }) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB.getTime() - dateA.getTime();
            });
            setNotes(sortedNotes);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/postNotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telefono: numeroWhatsapp,
                    content: newNote
                })
            });

            if (!response.ok) throw new Error('Error adding note');

            await fetchNotes();
            setNewNote('');
            setIsExpanded(true);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lead-notes-container">
            <div
                className="lead-notes-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="lead-notes-title">Notas ({notes.length})</h3>
                <svg
                    className={`lead-notes-arrow ${isExpanded ? 'expanded' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            {isExpanded && (
                <div className="lead-notes-content">
                    <div className="lead-notes-input-container">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="lead-notes-textarea"
                            placeholder="Agregar una nota..."
                            rows={3}
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={isLoading || !newNote.trim()}
                            className="lead-notes-button"
                        >
                            {isLoading ? 'Agregando...' : 'Agregar Nota'}
                        </button>
                    </div>

                    <div className="lead-notes-list">
                        {notes && notes.length > 0 ? (
                            notes.map((note, index) => (
                                <div key={index} className="lead-notes-item">
                                    <p className="lead-notes-text">{note.content}</p>
                                    <span className="lead-notes-timestamp">
                                        {formatBogotaTime(note.timestamp)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="lead-notes-empty">No hay notas</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadNotes;