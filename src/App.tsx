import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import WhatsAppClone from './components/ClonWhatsapp';
import axios from 'axios';
import { BackendResponse, transformBackendToFrontend, Agente, BackendMensaje } from './components/types';
import { authService } from './services/authService.ts';
import './App.css';
import Login from './components/googleclud/LoginComponent.tsx';
import ConnectionOverlay from './components/ConnectionOverlay.tsx';
import { TemplateResponse } from './utils/templatesGenral/templateResponse.ts';
import { useKanbanStore } from './components/Kanban/store/kanbanStore.ts';
// import SidebarMenu from './components/clonHubSpot/MenuLateral.tsx'; esto pertenese a adriana pirazan esta en pausa por cambios al call center.

const endpointRestGeneral = import.meta.env.VITE_API_URL_GENERAL;
const socketEndpoint = import.meta.env.VITE_SOCKET_URL;
const CACHE_DURATION = 3600000;
const SYNC_INTERVAL = 30000;

function App() {
  const cambioArroba = (email: string) => {
    return email.replace('%40', '@');
  };

  const [email, setEmail] = useState(() => {
    const session = authService.getSession();
    return session?.email || '';
  });

  const formattedEmail = cambioArroba(email);

  const [agente, setAgente] = useState<Agente | null>(null);
  const [rawData, setRawData] = useState<BackendResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleLogout = () => {
    authService.clearSession();
    setEmail('');
    setAgente(null);
    setRawData([]);
    setError(null);
    socket?.disconnect();
    localStorage.removeItem('dataTimestamp');
    localStorage.removeItem('agenteData');
    localStorage.removeItem('rawData');
  };

  const handleEmailSet = async (newEmail: string) => {
    try {
      if (!newEmail || !newEmail.trim()) {
        setError('El correo electrónico es requerido');
        return;
      }
      setEmail(newEmail);
      authService.refreshSession(newEmail);
      await fetchData(0, newEmail);
    } catch (err) {
      console.error('Error al establecer email:', err);
      handleLogout();
    }
  };

  const fetchData = async (retryAttempt = 0, currentEmail?: string) => {
    try {
      const emailToUse = currentEmail || formattedEmail;

      if (!emailToUse || !emailToUse.trim()) {
        setError('Se requiere un correo electrónico válido');
        return;
      }

      setLoading(true);
      setError(null);

      // Verificar caché
      const cachedTimestamp = localStorage.getItem('dataTimestamp');
      const cachedData = localStorage.getItem('agenteData');
      const isValidCache = cachedTimestamp && cachedData &&
        (Date.now() - parseInt(cachedTimestamp)) < CACHE_DURATION;

      if (isValidCache && emailToUse === formattedEmail) {
        const parsedData = JSON.parse(cachedData);
        if (!parsedData || Object.keys(parsedData).length === 0) {
          handleLogout();
          setError('No se encontraron conversaciones para este usuario.');
          return;
        }
        setAgente(parsedData);
        setRawData(JSON.parse(localStorage.getItem('rawData') || '[]'));
        return;
      }

      const response = await axios.get<BackendResponse[]>(
        `${endpointRestGeneral}/getLeadsTipoGestion`,
        {
          params: { correoAgente: emailToUse },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`email en uso: ${emailToUse}`);

      if (!response.data || response.data.length === 0) {
        throw new Error('No se encontraron conversaciones para este usuario.');
      }

      const rawData = response.data;
      const transformedData = transformBackendToFrontend(rawData);

      setRawData(rawData);
      setAgente(transformedData);
      localStorage.setItem('agenteData', JSON.stringify(transformedData));
      localStorage.setItem('rawData', JSON.stringify(rawData));
      localStorage.setItem('dataTimestamp', Date.now().toString());

      authService.refreshSession(emailToUse);
    } catch (error) {
      console.error(`este es el email que se pasa: ${formattedEmail}`);
      console.error('Error al obtener los datos:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setError('Se requiere un correo electrónico válido');
        } else {
          setError('Error al cargar los datos. Por favor, intente más tarde.');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error desconocido al cargar los datos');
      }

      if (retryAttempt < 3) {
        setTimeout(() => fetchData(retryAttempt + 1, currentEmail), 2000);
      } else {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    if (!formattedEmail || !isConnected) return;

    try {
      const response = await axios.get<BackendResponse[]>(
        `${endpointRestGeneral}/getLeadsTipoGestion`,
        {
          params: { correoAgente: formattedEmail },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.length > 0) {
        const processedData = response.data.map(conv => ({
          ...conv,
          mensajes: conv.mensajes.map(msg => {
            let processedMsg: BackendMensaje = {
              _id: msg._id,
              tipo: msg.tipo,
              contenido: msg.contenido,
              fecha: msg.fecha,
              usuario_destino: msg.usuario_destino,
              mensaje_id: msg.mensaje_id || msg.id_message || msg._id, // Aseguramos que siempre haya un mensaje_id
              id_message: msg.id_message,
              messageType: msg.messageType || 'text'
            };

            // Process message status from statusHistory first
            if (msg.statusHistory && msg.statusHistory.length > 0) {
              const sortedHistory = [...msg.statusHistory].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );

              const currentStatus = sortedHistory[0];
              if (currentStatus) {
                processedMsg.status = currentStatus.status;
                processedMsg.statusTimestamp = new Date(currentStatus.timestamp); // Convertir a Date
                processedMsg.statusHistory = msg.statusHistory.map(history => ({
                  ...history,
                  timestamp: new Date(history.timestamp) // Convertir cada timestamp a Date
                }));
              }
            } else {
              processedMsg.status = 'sent';
              processedMsg.statusTimestamp = new Date(msg.fecha);
            }

            // Process file types
            if (msg.contenido.startsWith('image/') || msg.archivo === 'image/jpeg') {
              processedMsg = {
                ...processedMsg,
                contenido: msg.url_archivo || msg.archivo || msg.contenido,
                tipo_archivo: 'image',
                url_archivo: msg.url_archivo,
                archivo: msg.archivo,
                nombre_archivo: msg.mensaje || msg.nombre_archivo,
                messageType: 'image',
                mime_type: msg.mime_type,
                caption: msg.caption
              };
            } else if (msg.contenido.startsWith('audio/') || msg.archivo === 'audio/ogg') {
              processedMsg = {
                ...processedMsg,
                contenido: msg.url_archivo || msg.archivo || msg.contenido,
                tipo_archivo: 'audio',
                url_archivo: msg.url_archivo,
                archivo: msg.archivo,
                nombre_archivo: msg.mensaje || msg.nombre_archivo,
                messageType: 'audio',
                mime_type: msg.mime_type
              };
            } else if (msg.contenido.includes('/') && !msg.contenido.startsWith('image/') && !msg.contenido.startsWith('audio/')) {
              processedMsg = {
                ...processedMsg,
                contenido: msg.url_archivo || msg.archivo || msg.contenido,
                tipo_archivo: 'document',
                url_archivo: msg.url_archivo,
                archivo: msg.archivo,
                nombre_archivo: msg.mensaje || msg.nombre_archivo,
                messageType: 'document',
                mime_type: msg.mime_type,
                caption: msg.caption
              };
            }

            return processedMsg;
          })
        }));

        const rawData = processedData;
        const transformedData = transformBackendToFrontend(rawData);

        setRawData(rawData);
        setAgente(transformedData);
        localStorage.setItem('rawData', JSON.stringify(rawData));
        localStorage.setItem('agenteData', JSON.stringify(transformedData));
        localStorage.setItem('dataTimestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Error durante la sincronización:', error);
    }
  };

  useEffect(() => {
    if (formattedEmail && isConnected) {
      const intervalId = setInterval(syncData, SYNC_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [formattedEmail, isConnected]);

  useEffect(() => {
    const checkSession = () => {
      if (formattedEmail && !authService.isAuthenticated()) {
        handleLogout();
      }
    };

    const intervalId = setInterval(checkSession, 60000);
    return () => clearInterval(intervalId);
  }, [formattedEmail]);

  useEffect(() => {
    const session = authService.getSession();
    if (session?.email) {
      handleEmailSet(session.email);
    }
  }, []);

  useEffect(() => {
    if (formattedEmail) {
      fetchData();
    }
  }, [formattedEmail]);

  useEffect(() => {
    if (!formattedEmail) return;

    const newSocket = io(socketEndpoint);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      syncData();
    });

    newSocket.on('messageSent', (data) => {
      console.log(data.metaMessageId);
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === data.to
        );

        if (conversationIndex !== -1) {
          existingRawData[conversationIndex].mensajes.push({
            _id: data.metaMessageId,
            tipo: 'saliente',
            contenido: data.message,
            fecha: new Date().toISOString(),
            usuario_destino: data.to,
            mensaje_id: data.metaMessageId || '', // Asegurarse de que este campo exista
            status: 'sent' // Agregar estado inicial
          });

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error updating local storage:', err);
        handleLogout();
      }
    });

    newSocket.on('newMessage', (mensajeCapturado) => {
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === mensajeCapturado.customerNumber
        );

        if (conversationIndex !== -1) {
          existingRawData[conversationIndex].mensajes.push({
            _id: new Date().getTime().toString(),
            tipo: 'entrante',
            contenido: mensajeCapturado.message,
            fecha: new Date(parseInt(mensajeCapturado.timestamp) * 1000).toISOString(),
            usuario_destino: mensajeCapturado.customerNumber,
            mensaje_id: mensajeCapturado.messageId || ''
          });

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error procesando nuevo mensaje:', err);
        handleLogout();
      }
    });

    newSocket.on('templateSent', (data: TemplateResponse) => {
      console.log(`Esto es lo que llega de la solicitud del envio del template, esta es la response que devuelve el server: ${JSON.stringify(data, null, 2)}`);
      try {
        // Extraer información del template
        const phoneNumber = data.templateFormado.to;
        const templateText = data.templateFormado.processedText;

        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === phoneNumber
        );

        if (conversationIndex !== -1) {
          const newMessage = {
            _id: data.response.messages[0].id,
            tipo: 'saliente',
            contenido: templateText,
            fecha: new Date().toISOString(),
            usuario_destino: phoneNumber,
            mensaje_id: data.response.messages[0].id
          };

          // Actualizamos los mensajes de la conversación
          existingRawData[conversationIndex].mensajes.push(newMessage);

          // Transformamos y actualizamos el estado
          const updatedAgente = transformBackendToFrontend(existingRawData);

          // Actualizamos localStorage
          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          // Actualizamos el estado de la aplicación
          setRawData(existingRawData);
          setAgente(updatedAgente);

          console.log('Template message added:', newMessage);
        } else {
          console.warn('Conversation not found for phone number:', phoneNumber);

          const newConversation: BackendResponse = {
            _id: new Date().getTime().toString(),
            numero_cliente: phoneNumber,
            nombre_cliente: 'Nuevo Cliente',
            nombre_agente: '',
            correo_agente: '',
            rol_agente: 'agent',
            tipo_gestion: 'sin gestionar',
            mensajes: [{
              _id: data.response.messages[0].id,
              tipo: 'saliente',
              contenido: templateText,
              fecha: new Date().toISOString(),
              usuario_destino: phoneNumber,
              mensaje_id: data.response.messages[0].id
            }]
          };

          existingRawData.push(newConversation);

          // Transformamos y actualizamos el estado
          const updatedAgente = transformBackendToFrontend(existingRawData);

          // Actualizamos localStorage
          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          // Actualizamos el estado de la aplicación
          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error updating template message in local storage:', err);
        handleLogout();
      }
    });


    newSocket.on('fileSent', (data) => {
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === data.to
        );

        if (conversationIndex !== -1) {
          const newMessage = {
            _id: data.metaMessageId || new Date().getTime().toString(),
            tipo: 'saliente',
            contenido: data.nameFileToS3,
            fecha: new Date().toISOString(),
            usuario_destino: data.to,
            mensaje_id: data.metaMessageId || '',
            tipo_archivo: getFileType(data.fileName),
            url_archivo: data.nameFileToS3,
            nombre_archivo: data.fileName,
            caption: data.caption || ''
          };

          existingRawData[conversationIndex].mensajes.push(newMessage);

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error updating local storage with file:', err);
        handleLogout();
      }
    });

    newSocket.on('newFile', (dataFile) => {
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === dataFile.customerNumber
        );

        if (conversationIndex !== -1) {
          const newMessage = {
            _id: new Date().getTime().toString(),
            tipo: 'entrante',
            contenido: dataFile.s3Url,
            fecha: new Date(parseInt(dataFile.timestamp) * 1000).toISOString(),
            usuario_destino: dataFile.customerNumber,
            mensaje_id: dataFile.messageId,
            tipo_archivo: getFileType(dataFile.fileName),
            url_archivo: dataFile.s3Url,
            nombre_archivo: dataFile.fileName,
            caption: dataFile.caption || '',
            mime_type: dataFile.mimeType
          };

          existingRawData[conversationIndex].mensajes.push(newMessage);

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error procesando nuevo archivo:', err);
        handleLogout();
      }
    });

    newSocket.on('newFileAudio', (dataFileAudio) => {
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === dataFileAudio.customerNumber
        );

        if (conversationIndex !== -1) {
          const newMessage = {
            _id: new Date().getTime().toString(),
            tipo: 'entrante',
            contenido: dataFileAudio.s3Audio,
            fecha: new Date(parseInt(dataFileAudio.timestamp) * 1000).toISOString(),
            usuario_destino: dataFileAudio.customerNumber,
            mensaje_id: dataFileAudio.messageId,
            tipo_archivo: 'audio',
            url_archivo: dataFileAudio.s3Audio,
            nombre_archivo: `audio_${dataFileAudio.messageId}.ogg`,
            mime_type: dataFileAudio.mimeType,
            archivo: dataFileAudio.s3Audio
          };

          existingRawData[conversationIndex].mensajes.push(newMessage);

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error procesando nuevo audio:', err);
        handleLogout();
      }
    });

    newSocket.on('UpdateTipogestion', (updateTipoGestion) => {
      console.log(JSON.stringify(updateTipoGestion, null, 2));
      try {
        const existingRawData = JSON.parse(localStorage.getItem('rawData') || '[]');
        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === updateTipoGestion.numero_cliente
        );

        const kanbanStore = useKanbanStore.getState();
        if (Object.keys(kanbanStore.lists).length === 0) {
          kanbanStore.initializeLists();
        }

        kanbanStore.updateTaskListByTipoGestion(
          updateTipoGestion.numero_cliente,
          updateTipoGestion.tipo_gestion,
          updateTipoGestion.nameLead
        );

        if (conversationIndex !== -1) {
          existingRawData[conversationIndex].tipo_gestion = updateTipoGestion.tipo_gestion;

          const updatedAgente = transformBackendToFrontend(existingRawData);

          localStorage.setItem('rawData', JSON.stringify(existingRawData));
          localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
          localStorage.setItem('dataTimestamp', Date.now().toString());

          setRawData(existingRawData);
          setAgente(updatedAgente);
        }
      } catch (err) {
        console.error('Error actualizando tipo de gestión:', err);
        handleLogout();
      }
    });

    newSocket.on('newLeadNotification', (newLead: {
      numero_cliente: string;
      nombre_cliente: string;
      nombre_agente: string;
      correo_agente: string;
      rol_agente: string;
      tipo_gestion: string;
      mensajes: {
        _id: string;
        tipo: 'entrante' | 'saliente';
        contenido: string;
        fecha: string;
        usuario_destino: string;
        mensaje_id: string;
      }[];
    }) => {
      try {
        const existingRawData: BackendResponse[] = JSON.parse(localStorage.getItem('rawData') || '[]');

        const conversationIndex = existingRawData.findIndex(
          (conv: BackendResponse) => conv.numero_cliente === newLead.numero_cliente
        );

        const newLeadData: BackendResponse = {
          _id: new Date().getTime().toString(),
          numero_cliente: newLead.numero_cliente,
          nombre_cliente: newLead.nombre_cliente,
          nombre_agente: newLead.nombre_agente,
          correo_agente: newLead.correo_agente,
          rol_agente: newLead.rol_agente,
          tipo_gestion: newLead.tipo_gestion,
          mensajes: newLead.mensajes.map(msg => ({
            _id: msg._id,
            tipo: msg.tipo,
            contenido: msg.contenido,
            fecha: msg.fecha,
            usuario_destino: msg.usuario_destino,
            mensaje_id: msg.mensaje_id
          }))
        };

        if (conversationIndex === -1) {
          existingRawData.push(newLeadData);
        } else {
          existingRawData[conversationIndex] = {
            ...existingRawData[conversationIndex],
            tipo_gestion: newLeadData.tipo_gestion
          };
        }

        const updatedAgente = transformBackendToFrontend(existingRawData);

        localStorage.setItem('rawData', JSON.stringify(existingRawData));
        localStorage.setItem('agenteData', JSON.stringify(updatedAgente));
        localStorage.setItem('dataTimestamp', Date.now().toString());

        setRawData(existingRawData);
        setAgente(updatedAgente);

      } catch (err) {
        console.error('Error actualizando localStorage con el nuevo lead:', err);
        handleLogout();
      }
    });

    newSocket.on('error', (error) => {
      console.error('Error:', error);
      handleLogout();
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };

  }, [formattedEmail]);

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const videoExtensions = ['mp4', 'mov'];

    if (imageExtensions.includes(extension || '')) return 'image';
    if (audioExtensions.includes(extension || '')) return 'audio';
    if (videoExtensions.includes(extension || '')) return 'video';
    return 'document';
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!formattedEmail || error) {
    return (
      <Login
        setEmail={handleEmailSet}
        error={error}
        setError={setError}
        fetchData={fetchData}
      />
    );
  }

  return (
    <>
      <ConnectionOverlay isConnected={isConnected} />
      <WhatsAppClone
        email={formattedEmail}
        setEmail={handleLogout}
        initialAgente={agente}
        initialData={rawData}
        socket={socket}
      />
    </>
  );
}

export default App;