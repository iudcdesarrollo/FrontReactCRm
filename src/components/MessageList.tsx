import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import { saveAs } from 'file-saver';
import { FileText, Music } from 'lucide-react';
import '../css/Agentes/MessageList.css';
import { isValidUrl } from '../utils/isValidUrl.ts';
import { getFileExtensionFromUrl } from '../utils/getFileExtensionFromUrl.ts';
import { MessageListProps, MessageStatus } from './@types/mensajeList.ts';
import { ImageModal, UrlPreview } from './preview/UrlPreview.tsx';

const endpointRestGeneral = import.meta.env.VITE_API_URL_GENERAL;

const statusTranslations: { [key: string]: string } = {
    'sent': 'enviado',
    'delivered': 'entregado',
    'read': 'leído',
    'pending': 'pendiente',
    'error': 'error'
};

const validFileExtensions = {
    audio: ['mp3', 'wav', 'ogg'],
    image: ['jpg', 'jpeg', 'png', 'gif'],
    video: ['mp4', 'mov'],
    document: ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'txt']
};

const MessageList: React.FC<MessageListProps> = ({
    messages,
    selectedChat,
    downloads,
    downloadFile,
    enpointAwsBucked,
    profilePictureUrl,
    socket,
    numberWhatsApp
}) => {
    const [audioPlaying, setAudioPlaying] = useState<{ [key: string]: boolean }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messageStatuses, setMessageStatuses] = useState<{ [key: string]: string }>({});

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (socket) {
            socket.on('messageStatus', (status: MessageStatus) => {
                setMessageStatuses(prev => ({
                    ...prev,
                    [status.messageId]: status.status
                }));
            });
        }

        return () => {
            socket?.off('messageStatus');
        };
    }, [socket, messages]);

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

    const fetchMessageStatuses = async () => {
        try {
            const response = await fetch(`${endpointRestGeneral}/getStatusHistory/${numberWhatsApp}`);
            const data = await response.json();

            if (data.success && data.data) {
                const latestStatuses: { [key: string]: string } = {};
                data.data.forEach((message: {
                    mensaje_id: string,
                    statusHistory: Array<{ status: string, timestamp: string }>
                }) => {
                    if (message.statusHistory.length > 0) {
                        const lastStatus = message.statusHistory[message.statusHistory.length - 1].status;
                        latestStatuses[message.mensaje_id] = lastStatus;
                    }
                });
                setMessageStatuses(latestStatuses);
            }
        } catch (error) {
            console.error('Error al obtener el historial de estados:', error);
        }
    };

    useEffect(() => {
        if (numberWhatsApp) {
            fetchMessageStatuses();
        }
    }, [numberWhatsApp]);

    const isAudioFile = (extension?: string): boolean =>
        validFileExtensions.audio.includes(extension?.toLowerCase() || '');

    const isImageFile = (extension?: string): boolean =>
        validFileExtensions.image.includes(extension?.toLowerCase() || '');

    const isVideoFile = (extension?: string): boolean =>
        validFileExtensions.video.includes(extension?.toLowerCase() || '');

    const isValidFileType = (extension?: string): boolean => {
        if (!extension) return false;
        const lowerExt = extension.toLowerCase();
        return [...validFileExtensions.audio,
        ...validFileExtensions.image,
        ...validFileExtensions.video,
        ...validFileExtensions.document
        ].includes(lowerExt);
    };

    const getMessageStatus = (msg: Message) => {
        const messageId = msg.id;
        let status = messageId && messageStatuses[messageId]
            ? messageStatuses[messageId]
            : msg.status || 'pending';
        status = status.toLowerCase();
        return statusTranslations[status] || status;
    };

    const formatDateTime = (timestamp: string | undefined) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

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
                if (!isValidFileType(extension)) {
                    return <span className="message-text">{msg.message}</span>;
                }

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
                    <div className="message-status">
                        {`Estado: ${getMessageStatus(msg)} - ${formatDateTime(msg.timestamp)}`}
                    </div>
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