import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Card, CardContent, Typography, Box, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Socket } from 'socket.io-client';

interface TemplateCardProps {
    socket: Socket | null;
}

interface TemplateComponent {
    type: string;
    text: string;
    example: {
        body_text: string[][];
    };
}

interface Template {
    _id: string;
    name: string;
    language: string;
    category: string;
    status: string;
    components: TemplateComponent[];
    createdAt: string;
    templateId: string;
    bussines_id: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ socket }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const sortTemplates = (templates: Template[]) => {
        return templates.sort((a, b) =>
            a.status === 'APPROVED' && b.status !== 'APPROVED' ? -1 :
                a.status !== 'APPROVED' && b.status === 'APPROVED' ? 1 : 0
        );
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL_GENERAL}/templatesList`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setTemplates(sortTemplates(response.data));
            } catch (error) {
                const axiosError = error as AxiosError;
                setError(`Error al cargar los templates: ${axiosError.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('updateTemplateStatus', (response) => {
                const templateName = response.template_name;
                const newStatus = response.status;

                setTemplates((prevTemplates) => {
                    const updatedTemplates = prevTemplates.map((template) =>
                        template.name === templateName
                            ? { ...template, status: newStatus }
                            : template
                    );

                    return updatedTemplates.sort((a, b) =>
                        a.status === 'APPROVED' && b.status !== 'APPROVED' ? -1 :
                            a.status !== 'APPROVED' && b.status === 'APPROVED' ? 1 : 0
                    );
                });
            });

            socket.on('templateDeleted', (response) => {
                console.log(response.message);
                if (selectedTemplate) {
                    setTemplates((prev) =>
                        prev
                            .filter((template) => template.name !== selectedTemplate.name)
                            .sort((a, b) =>
                                a.status === 'APPROVED' && b.status !== 'APPROVED' ? -1 :
                                    a.status !== 'APPROVED' && b.status === 'APPROVED' ? 1 : 0
                            )
                    );
                }
            });

            socket.on('error', (error) => {
                console.error('Error deleting template:', error.message);
                setError(error.message);
            });

            return () => {
                socket.off('updateTemplateStatus');
                socket.off('templateDeleted');
                socket.off('error');
            };
        }
    }, [socket, selectedTemplate]);

    const handleDeleteClick = (template: Template) => {
        setSelectedTemplate(template);
        setOpenDialog(true);
    };

    const handleConfirmDelete = () => {
        if (socket && selectedTemplate) {
            socket.emit('deleteTemplate', { templateName: selectedTemplate.name });
        }
        setOpenDialog(false);
        setSelectedTemplate(null);
    };

    if (loading) return <Box className="loading-container"><CircularProgress /></Box>;
    if (error) return <Box className="error-container"><Typography variant="h6" color="error">{error}</Typography></Box>;

    return (
        <Box className="template-card">
            <Typography variant="h4" align="center" sx={{ py: 3, fontWeight: 700, color: '#000' }}>
                Lista de templates en Meta
            </Typography>
            <Box className="template-grid" sx={{ gap: '60px' }}>
                {templates && templates.length > 0 ? (
                    templates.map((template) => (
                        <Card
                            key={template._id}
                            className="template-item"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                position: 'relative'
                            }}
                        >
                            {template.status !== 'PENDING_DELETION' && (
                                <IconButton
                                    onClick={() => handleDeleteClick(template)}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                        color: 'error.main'
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                            <CardContent sx={{ flex: '1 0 auto', pb: 2, pt: 4 }}>
                                <Box className="template-info" sx={{ mb: 2 }}>
                                    <Typography component="span">
                                        <strong>Nombre:</strong> {template.name}
                                    </Typography>
                                </Box>
                                <Box className="template-info">
                                    <Typography component="span">
                                        <strong>Categoría:</strong> {template.category}
                                    </Typography>
                                </Box>
                                <Box className="template-info">
                                    <Typography component="span">
                                        <strong>Idioma:</strong> {template.language}
                                    </Typography>
                                </Box>
                                <Box className="template-info">
                                    <Typography component="span">
                                        <strong>Estado:</strong> {template.status}
                                    </Typography>
                                </Box>
                                <Typography className="template-text">
                                    {template.components[0].text}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body1" align="center">
                        No hay templates disponibles
                    </Typography>
                )}
            </Box>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar el template "{selectedTemplate?.name}"?
                        Ten en cuenta que la eliminación completa puede tardar hasta 30 días en Meta (WhatsApp).
                        Una vez transcurrido este período, podrás volver a crear o reutilizar una plantilla con este nombre.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplateCard;