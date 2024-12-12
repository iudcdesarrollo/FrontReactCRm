import { Component } from 'react';
import '../css/Agentes/whatsappClone.css';
import LeftSidebar from './LeftSidebar';
import ChatInterface from './ChatInterface';
import Settings from './setting/Settings';
import {
    WhatsAppCloneProps,
    WhatsAppCloneState,
    getDownloadsFromMessages
} from './types';
import Metrics from './Metricas/Metrics';

class WhatsAppClone extends Component<WhatsAppCloneProps, WhatsAppCloneState> {
    constructor(props: WhatsAppCloneProps) {
        super(props);
        this.state = {
            searchTerm: '',
            selectedCategory: 'Todos',
            selectedChat: null,
            agente: props.initialAgente || null,
            downloads: [],
            showMetrics: false,
            showSettings: false
        };
    }

    onSelectMetrics = () => {
        this.setState({
            showMetrics: true,
            showSettings: false
        });
    };

    componentDidUpdate(prevProps: WhatsAppCloneProps) {
        if (prevProps.initialAgente !== this.props.initialAgente && this.props.initialAgente) {
            this.setState({
                agente: this.props.initialAgente,
                downloads: this.props.initialData ? getDownloadsFromMessages(this.props.initialData) : []
            });
        }
    }

    handleLogout = () => {
        localStorage.removeItem('agenteData');
        this.props.setEmail('');
    };

    toggleSettings = () => {
        this.setState(prevState => ({
            showSettings: !prevState.showSettings,
            showMetrics: false
        }));
    };

    onSelectHome = () => {
        this.setState({
            showMetrics: false,
            showSettings: false
        });
    };

    setSearchTerm = (term: string) => {
        this.setState({ searchTerm: term });
    };

    setSelectedCategory = (category: string) => {
        this.setState({ selectedCategory: category });
    };

    setSelectedChat = (chatId: number | null) => {
        this.setState({ selectedChat: chatId });
    };

    downloadFile = async (url: string, fileName: string, chatId: number) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            this.setState(prevState => ({
                downloads: prevState.downloads.map(download =>
                    download.chatId === chatId && download.fileName === fileName
                        ? { ...download, downloaded: true }
                        : download
                )
            }));
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };

    renderMainContent() {
        const {
            searchTerm,
            selectedCategory,
            selectedChat,
            agente,
            downloads,
            showMetrics,
            showSettings
        } = this.state;

        const role = agente?.rol === 'admin' ? 'admin' : 'agent';

        if (showMetrics) {
            return <Metrics />;
        }

        if (showSettings) {
            return (
                <Settings
                    socket={this.props.socket}
                    isOpen={true}
                    onClose={this.toggleSettings}
                />
            );
        }

        return (
            <ChatInterface
                chats={agente?.leads || []}
                agente={agente}
                downloads={downloads}
                searchTerm={searchTerm}
                setSearchTerm={this.setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={this.setSelectedCategory}
                selectedChat={selectedChat}
                setSelectedChat={this.setSelectedChat}
                downloadFile={this.downloadFile}
                enpointAwsBucked="your-aws-bucket-endpoint"
                setEmail={this.props.setEmail}
                role={role}
                socket={this.props.socket}
            />
        );
    }

    render() {
        const role = this.state.agente?.rol === 'admin' ? 'admin' : 'agent';

        return (
            <div className="whatsapp-clone-container">
                {role !== 'agent' && (
                    <div className="w-1/5">
                        <LeftSidebar
                            handleLogout={this.handleLogout}
                            toggleSettings={this.toggleSettings}
                            onSelectHome={this.onSelectHome}
                            onSelectMetrics={this.onSelectMetrics}
                        />
                    </div>
                )}
                <div className={`flex-grow ${role === 'agent' ? 'w-full' : ''}`}>
                    {this.renderMainContent()}
                </div>
            </div>
        );
    }
}

export default WhatsAppClone;