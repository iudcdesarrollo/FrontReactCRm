import React, { useState, useEffect, useRef } from 'react';
import { Message, Download } from './types';
import { saveAs } from 'file-saver';
import { Link, FileText, Video, Music, Image as ImageIcon, X } from 'lucide-react';
import '../css/Agentes/MessageList.css';
import { isValidUrl } from '../utils/isValidUrl.ts';
import { getFileExtensionFromUrl } from '../utils/getFileExtensionFromUrl.ts';
import { Socket } from 'socket.io-client';

interface MessageListProps {
    messages: Message[];
    selectedChat: number;
    downloads: Download[];
    downloadFile: (url: string, fileName: string, chatId: number) => Promise<void>;
    enpointAwsBucked: string;
    profilePictureUrl: string | null;
    socket: Socket | null;
}

interface MessageStatus {
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
    timestamp: string;
    recipientId: string;
}

interface UrlPreviewProps {
    url: string;
    extension: string | null;
    onDownload: () => void;
}

interface PreviewData {
    title?: string;
    description?: string;
    image?: string;
    icon?: React.ReactNode;
}

interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
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

const UrlPreview: React.FC<UrlPreviewProps> = ({ url, extension, onDownload }) => {
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
                        icon: <Link className="preview-icon" />
                    });
                    return;
                }

                const ext = extension.toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
                    setPreviewData({
                        title: 'Image Preview',
                        image: url,
                        icon: <ImageIcon className="preview-icon" />
                    });
                } else if (['mp4', 'mov'].includes(ext)) {
                    setPreviewData({
                        title: 'Video File',
                        description: 'Click to play video',
                        icon: <Video className="preview-icon" />
                    });
                } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                    setPreviewData({
                        title: 'Audio File',
                        description: 'Click to play audio',
                        icon: <Music className="preview-icon" />
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
                        icon: <FileText className="preview-icon" />
                    });
                } else {
                    setPreviewData({
                        title: 'Link Preview',
                        description: url,
                        icon: <Link className="preview-icon" />
                    });
                }
            } catch (error) {
                console.error('Error fetching preview:', error);
                setPreviewData({
                    title: 'Link Preview',
                    description: url,
                    icon: <Link className="preview-icon" />
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();
    }, [url, extension]);

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

const MessageList: React.FC<MessageListProps> = ({
    messages,
    selectedChat,
    downloads,
    downloadFile,
    enpointAwsBucked,
    profilePictureUrl,
    socket
}) => {
    const [audioPlaying, setAudioPlaying] = useState<{ [key: string]: boolean }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socket) {
            socket.on('messageStatus', (status: MessageStatus) => {
                console.log('Estado de mensaje recibido:', status.status, status.recipientId, status.messageId);
            });
        }

        return () => {
            socket?.off('messageStatus');
        };
    }, [socket]);

    const handleFileDownload = async (url: string, fileName: string) => {
        try {
            await downloadFile(url, fileName, selectedChat);
            const extension = fileName.split('.').pop()?.toLowerCase();
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();

            if (extension === 'xlsx' || extension === 'xls') {
                const mimeType = extension === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/vnd.ms-excel';
                const excelBlob = new Blob([await response.arrayBuffer()], {
                    type: mimeType
                });
                saveAs(excelBlob, fileName);
            } else {
                saveAs(blob, fileName);
            }

            if (isAudioFile(extension)) {
                setAudioPlaying(prev => ({ ...prev, [fileName]: true }));
            }
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            if (error instanceof Error) {
                alert(`Error al descargar el archivo: ${error.message}`);
            }
        }
    };

    const isAudioFile = (extension?: string): boolean =>
        ['mp3', 'wav', 'ogg'].includes(extension || '');

    const isImageFile = (extension?: string): boolean =>
        ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '');

    const isVideoFile = (extension?: string): boolean =>
        ['mp4', 'mov'].includes(extension || '');

    const renderMessage = (msg: Message, index: number) => {
        if (!msg.message.trim()) {
            return null;
        }

        const isUrl = isValidUrl(msg.message);
        const isFileUrl = msg.message.includes(enpointAwsBucked);
        const fileName = msg.message.split('/').pop() || 'file';
        const extension = fileName.split('.').pop()?.toLowerCase();
        const isDownloaded = downloads.some(d =>
            d.url.includes(msg.message) && d.chatId === selectedChat);

        const renderContent = () => {
            if (isUrl) {
                const { extension } = getFileExtensionFromUrl(msg.message);
                return (
                    <UrlPreview
                        url={msg.message}
                        extension={extension}
                        onDownload={() => handleFileDownload(msg.message, fileName)}
                    />
                );
            }

            if (isFileUrl) {
                if (isAudioFile(extension)) {
                    if (isDownloaded || audioPlaying[fileName]) {
                        return (
                            <audio
                                controls
                                className="audio-player"
                                onEnded={() => setAudioPlaying(prev => ({ ...prev, [fileName]: false }))}
                                src={downloads.find(d => d.fileName === fileName && d.chatId === selectedChat)?.url || msg.message}
                            >
                                Tu navegador no soporta el elemento de audio.
                            </audio>
                        );
                    }
                    return (
                        <div className="audio-preview">
                            <Music className="audio-icon" />
                            <button
                                className="play-button"
                                onClick={() => handleFileDownload(msg.message, fileName)}
                            >
                                Reproducir audio
                            </button>
                        </div>
                    );
                }

                if (isImageFile(extension)) {
                    return (
                        <div className="image-container">
                            <img
                                src={msg.message}
                                alt="Imagen"
                                className="message-image"
                                onClick={() => setSelectedImage(msg.message)}
                            />
                            <p className="file-name">{fileName}</p>
                        </div>
                    );
                }

                if (isVideoFile(extension)) {
                    return (
                        <div className="video-container">
                            <video controls className="message-video">
                                <source src={msg.message} type="video/mp4" />
                                Tu navegador no soporta el video.
                            </video>
                            <p className="file-name">{fileName}</p>
                        </div>
                    );
                }

                return (
                    <div className="file-download">
                        <FileText className="file-icon" />
                        <button
                            className="download-button"
                            onClick={() => handleFileDownload(msg.message, fileName)}
                        >
                            Descargar {fileName}
                        </button>
                    </div>
                );
            }

            return <span className="message-text">{msg.message}</span>;
        };

        return (
            <div key={index} className={`message-row ${msg.Cliente ? 'message-client' : 'message-agent'}`}>
                {msg.Cliente && (
                    <div className="profile-container">
                        {profilePictureUrl ? (
                            <img
                                src={profilePictureUrl}
                                alt="Profile"
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-placeholder" />
                        )}
                    </div>
                )}
                <div className="message-bubble">
                    {renderContent()}
                    <div className="message-status">{`Estado: ${msg.status}`}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="message-list">
            <div className="messages-container">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>
            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
};

export default MessageList;