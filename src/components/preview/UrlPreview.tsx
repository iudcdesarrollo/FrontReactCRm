import React, { useState, useEffect } from 'react';
import { Link, FileText, Video, Music, Image as ImageIcon, X } from 'lucide-react';
import '../../css/Agentes/MessageList.css';
import { ImageModalProps, PreviewData, UrlPreviewProps } from '../@types/mensajeList';

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close">
                    <X className="modal-close-icon" />
                </button>
                <img src={imageUrl} alt="Preview" className="modal-image" />
            </div>
        </div>
    );
};

export const UrlPreview: React.FC<UrlPreviewProps> = ({ url, extension, onDownload, timestamp }) => {
    const [previewData, setPreviewData] = useState<PreviewData>({});
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setLoading(true);
                if (!extension) {
                    setPreviewData({
                        title: 'Link Preview',
                        description: url,
                        icon: <Link className="preview-icon" />,
                        timestamp
                    });
                    return;
                }

                const ext = extension.toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                    setPreviewData({
                        title: 'Image Preview',
                        image: url,
                        icon: <ImageIcon className="preview-icon" />,
                        timestamp
                    });
                } else if (['mp4', 'mov'].includes(ext)) {
                    setPreviewData({
                        title: 'Video Preview',
                        description: 'Click para reproducir video',
                        icon: <Video className="preview-icon" />,
                        isAudio: false,
                        timestamp
                    });
                } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                    setPreviewData({
                        title: 'Audio',
                        icon: <Music className="preview-icon" />,
                        isAudio: true,
                        audioUrl: url,
                        timestamp
                    });
                } else if (['doc', 'docx', 'pdf', 'xlsx', 'xls'].includes(ext)) {
                    const fileTypeNames = {
                        doc: 'Word',
                        docx: 'Word',
                        pdf: 'PDF',
                        xlsx: 'Excel',
                        xls: 'Excel'
                    };
                    setPreviewData({
                        title: `${fileTypeNames[ext as keyof typeof fileTypeNames]} Document`,
                        description: 'Click para descargar',
                        icon: <FileText className="preview-icon" />,
                        timestamp
                    });
                } else {
                    setPreviewData({
                        title: 'Link Preview',
                        description: url,
                        icon: <Link className="preview-icon" />,
                        timestamp
                    });
                }
            } catch (error) {
                console.error('Error fetching preview:', error);
                setPreviewData({
                    title: 'Link Preview',
                    description: url,
                    icon: <Link className="preview-icon" />,
                    timestamp
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url, extension, timestamp]);

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDownload();
    };

    if (loading) {
        return <div className="preview-loading" />;
    }

    return (
        <>
            <div className="file-preview-container">
                {previewData.image ? (
                    <div className="image-preview">
                        <img
                            src={previewData.image}
                            alt={previewData.title}
                            className="preview-image"
                            onClick={() => setShowImageModal(true)}
                        />
                        <div className="file-icon-container">
                            {previewData.icon}
                            <div className="file-details">{previewData.title}</div>
                        </div>
                    </div>
                ) : previewData.isAudio ? (
                    <div className="audio-preview-card">
                        <div className="audio-preview-header">
                            <div className="audio-icon-wrapper">
                                <Music className="audio-preview-icon" />
                            </div>
                            <div className="audio-preview-info">
                                <span className="audio-preview-title">{previewData.title}</span>
                                {previewData.timestamp && (
                                    <span className="audio-preview-timestamp">
                                        {previewData.timestamp}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="audio-preview-player">
                            <audio controls className="custom-audio-player">
                                <source src={previewData.audioUrl} type={`audio/${extension?.toLowerCase()}`} />
                                Tu navegador no soporta la reproducción de audio.
                            </audio>
                        </div>
                    </div>
                ) : (
                    <div className="file-icon-container">
                        {previewData.icon}
                        <div className="file-details">
                            <div className="file-title">{previewData.title}</div>
                            <div className="file-description">
                                {previewData.description}
                            </div>
                        </div>
                        <button onClick={handleDownload} className="download-button">
                            <FileText className="download-icon" />
                        </button>
                    </div>
                )}
            </div>
            {showImageModal && (
                <ImageModal
                    imageUrl={previewData.image || ''}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </>
    );
};

export default UrlPreview;