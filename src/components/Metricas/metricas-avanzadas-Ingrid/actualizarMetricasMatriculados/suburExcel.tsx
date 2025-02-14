import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './subirArchivo.css';
import * as XLSX from 'xlsx';

type TipoNombre = 'profesional' | 'tecnico laboral' | 'especializacion' | 'homologacion';

interface ExcelData {
    [key: string]: string | number | Date;
}

const ExcelUploader: React.FC = () => {
    const [selectedType, setSelectedType] = useState<TipoNombre | ''>('');
    const [fileName, setFileName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            toast.error('Por favor seleccione un archivo');
            return;
        }

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
            return;
        }

        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellStyles: true
            });

            // Verificar si es una hoja de homologación
            if (selectedType === 'homologacion') {
                // Buscar una hoja que contenga 'HOMOLOGACIONES' en su nombre
                const homologacionSheet = workbook.SheetNames.find(name => 
                    name.toUpperCase().includes('HOMOLOGACIONES')
                );
                
                if (!homologacionSheet) {
                    throw new Error('No se encontró una hoja de homologaciones en el archivo');
                }
            }

            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                throw new Error('El archivo Excel está vacío');
            }

            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json<ExcelData>(worksheet);
            
            if (jsonData.length === 0) {
                throw new Error('No se encontraron datos en el archivo');
            }

            console.log('Datos preliminares:', jsonData[0]);
            await handleSubmit(file);
        } catch (error) {
            console.error('Error al procesar archivo:', error);
            toast.error(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            setFileName('');
            event.target.value = '';
        }
    };

    const handleSubmit = async (file: File) => {
        if (!selectedType || !file) {
            toast.warn('Por favor, selecciona un tipo y carga un archivo');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sheetName', selectedType);

            console.log('Enviando formData:', {
                file: file.name,
                sheetName: selectedType
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/UpdateDatabasewithExcel`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la respuesta del servidor');
            }

            const result = await response.json();

            if (result.success) {
                toast.success(`Archivo ${fileName} subido exitosamente ✅`);
                toast.info(`Total registros: ${result.totalRegistros} 📊`);
                
                if (result.tipo.homologacion) {
                    toast.info('Procesado como archivo de homologación');
                }
                
                setFileName('');
                setSelectedType('');
                const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                throw new Error(result.message || 'Error al procesar el archivo');
            }
        } catch (error) {
            console.error('Error en la subida:', error);
            toast.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'} ❌`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="uploader-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="uploader-content">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as TipoNombre)}
                    className="type-select"
                    disabled={isSubmitting}
                >
                    <option value="">Selecciona un tipo</option>
                    <option value="profesional">PROFESIONAL</option>
                    <option value="tecnico laboral">TÉCNICO</option>
                    <option value="especializacion">ESPECIALIZACIÓN</option>
                    <option value="homologacion">HOMOLOGACIÓN</option>
                </select>
                
                <div className="file-upload">
                    <label htmlFor="excel-upload" className="upload-label">
                        <Upload className="upload-icon" />
                        <span>Subir archivo Excel</span>
                        <input
                            type="file"
                            id="excel-upload"
                            className="file-input"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={isSubmitting}
                        />
                    </label>
                    {fileName && (
                        <p className="file-name">
                            Archivo seleccionado: {fileName}
                        </p>
                    )}
                </div>

                {isSubmitting && (
                    <div className="loading-message">
                        Procesando archivo...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExcelUploader;