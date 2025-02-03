import React, { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { MessageSenderProps } from './types';
import { Send, Mic, Paperclip, Image, FileText } from 'lucide-react';
import '../css/Agentes/MessageSender.css';
import TemplateForm from './setting/TemplateForm';

interface ExtendedMessageSenderProps extends MessageSenderProps {
    socket: Socket | null;
    agentEmail: string;
    agentRole: string;
    managementType: string;
}

const MessageSender: React.FC<ExtendedMessageSenderProps> = ({
    selectedChat,
    numberWhatsApp,
    nombreAgente,
    socket,
    agentEmail,
    agentRole,
    managementType
}) => {
    const [messageText, setMessageText] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [showTemplateForm, setShowTemplateForm] = useState(false);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                return; // Allow new line when Shift+Enter is pressed
            }
            event.preventDefault();
            sendMessage();
        } else if (event.key === '/') {
            setShowTemplateForm(true);
        } else {
            setShowTemplateForm(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                if (reader.result) {
                    setSelectedFile(file);
                    console.log('File selected:', file.type, file.name);
                }
            };
        }
        setShowFileMenu(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setRecordingStream(stream);

            const options = { mimeType: 'audio/webm;codecs=opus' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg;codecs=opus' });
                setAudioBlob(audioBlob);
                if (audioRef.current) {
                    const url = URL.createObjectURL(audioBlob);
                    audioRef.current.src = url;
                }
                stream.getTracks().forEach(track => track.stop());
                setRecordingStream(null);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleAudioRecord = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const sendMessage = async () => {
        if (!selectedChat || !socket) return;

        if (messageText.trim()) {
            const messagePayload = {
                to: numberWhatsApp,
                message: messageText,
                type: 'text',
                nombreAgente: nombreAgente,
                correoAgente: agentEmail,
                rolAgente: agentRole
            };
            socket.emit('sendMessage', messagePayload);
            setMessageText('');
        }

        if (selectedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                const base64data = reader.result as string;
                const filePayload = {
                    to: numberWhatsApp,
                    file: base64data,
                    fileName: selectedFile.name,
                    caption: selectedFile.name,
                    nombreAgente: nombreAgente,
                    correoAgente: agentEmail,
                    rolAgente: agentRole,
                    tipoGestion: managementType
                };
                socket.emit('sendFile', filePayload);
                setSelectedFile(null);
            };
        }

        if (audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onload = () => {
                const base64data = reader.result as string;
                const audioPayload = {
                    to: numberWhatsApp,
                    file: base64data,
                    fileName: 'audio.ogg',
                    nombreAgente: nombreAgente,
                    correoAgente: agentEmail,
                    rolAgente: agentRole,
                    tipoGestion: managementType
                };
                socket.emit('sendAudio', audioPayload);
                setAudioBlob(null);
                if (audioRef.current) {
                    audioRef.current.src = '';
                }
            };
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (!target.closest('.file-menu-container')) {
                setShowFileMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            if (recordingStream) {
                recordingStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [recordingStream]);

    return (
        <div className='message-sender-wrapper'>
            {showTemplateForm && (
                <div className="template-form-container">
                    <TemplateForm socket={socket} to={numberWhatsApp} />
                </div>
            )}
            <div className="message-sender-container">
                <div className="input-wrapper">
                    <textarea
                        placeholder="Escribe tu mensaje o utiliza / para enviar templates."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="message-input"
                        rows={1}
                    />
                </div>
                <button
                    className={`btn-action ${isRecording ? 'btn-recording' : ''}`}
                    onClick={handleAudioRecord}
                    title={isRecording ? "Stop recording" : "Start recording"}
                >
                    <Mic />
                </button>
                {audioBlob && (
                    <audio ref={audioRef} controls className="audio-preview">
                        Your browser does not support the audio element.
                    </audio>
                )}
                <div className="file-menu-container">
                    <button
                        className="btn-action"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFileMenu(!showFileMenu);
                        }}
                        title="Attach file"
                    >
                        <Paperclip />
                    </button>

                    {showFileMenu && (
                        <div className="file-menu">
                            <button
                                className="file-option"
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <Image size={20} />
                                <span>Image</span>
                            </button>
                            <button
                                className="file-option"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileText size={20} />
                                <span>Document</span>
                            </button>
                        </div>
                    )}

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
                <button
                    className="btn-send"
                    onClick={sendMessage}
                    title="Send message"
                    disabled={!messageText.trim() && !selectedFile && !audioBlob}
                >
                    <Send />
                </button>
            </div>
        </div>
    );
};

export default MessageSender;