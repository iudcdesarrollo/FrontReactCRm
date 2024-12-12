import React, { useEffect, useState } from 'react';

interface OggPlayerProps {
    url: string;
}

const OggPlayer: React.FC<OggPlayerProps> = ({ url }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAudio = async () => {
            try {
                setLoading(true);

                const response = await fetch(url);

                if (response.ok) {
                    const blob = await response.blob();
                    const audioObjectUrl = URL.createObjectURL(blob);
                    setAudioUrl(audioObjectUrl);
                } else {
                    console.error('Error al descargar el archivo');
                }
            } catch (error) {
                console.error('Hubo un error al obtener el archivo:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudio();
    }, [url]);

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <div>
            {audioUrl ? (
                <div>
                    <p>Reproduciendo: {url}</p>
                    <audio controls>
                        <source src={audioUrl} type="audio/ogg" />
                        Tu navegador no soporta el formato de audio OGG.
                    </audio>
                </div>
            ) : (
                <p>No se pudo cargar el archivo.</p>
            )}
        </div>
    );
};

export default OggPlayer;