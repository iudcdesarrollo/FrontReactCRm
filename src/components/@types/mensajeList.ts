import { Socket } from 'socket.io-client';
import { Download, Message } from '../types';

export interface MessageListProps {
    messages: Message[];
    selectedChat: number;
    downloads: Download[];
    downloadFile: (url: string, fileName: string, chatId: number) => Promise<void>;
    enpointAwsBucked: string;
    profilePictureUrl?: string;
    socket: Socket | null;
    numberWhatsApp: string
}

export interface MessageStatus {
    messageId: string;
    status: string;
    timestamp: string;
    recipientId: string;
    phoneNumberStatus: string
}

export interface UrlPreviewProps {
    url: string;
    extension: string | null;
    onDownload: () => void;
}

export interface PreviewData {
    title?: string;
    description?: string;
    image?: string;
    icon?: React.ReactNode;
}

export interface ImageModalProps {
    imageUrl: string;
    onClose: () => void;
}