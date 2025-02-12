import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import './subirArchivo.css'

interface XLSXWorkSheet {
    [cell: string]: unknown;
}

interface XLSXWorkBook {
    SheetNames: string[];
    Sheets: {
        [sheet: string]: XLSXWorkSheet;
    };
}

interface XLSX {
    read(data: ArrayBuffer, options: {
        type: string;
        cellDates: boolean;
        cellStyles: boolean;
    }): XLSXWorkBook;
    utils: {
        sheet_to_json<T>(worksheet: XLSXWorkSheet): T[];
    };
}

declare global {
    interface Window {
        XLSX: XLSX;
    }
}

type TipoNombre = 'PROFESIONAL' | 'TECNICO' | 'ESPECIALIZACION';

interface ExcelData {
    [key: string]: string | number | Date;
}

const ExcelUploader = () => {
    const [selectedType, setSelectedType] = useState<TipoNombre | ''>('');
    const [fileName, setFileName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = window.XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellStyles: true
            });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = window.XLSX.utils.sheet_to_json<ExcelData>(worksheet);
            console.log('Datos cargados:', jsonData);
        } catch (error) {
            console.error('Error al procesar el archivo:', error instanceof Error ? error.message : 'Error desconocido');
        }
    };

    const handleSubmit = async () => {
        if (!selectedType || !fileName) {
            alert('Por favor, selecciona un tipo y carga un archivo');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
            if (fileInput.files?.[0]) {
                formData.append('file', fileInput.files[0]);
                formData.append('sheetName', selectedType);

                const response = await fetch(`${import.meta.env.VITE_API_URL_GENERAL}/UpdateDatabasewithExcel`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    alert(`Archivo ${fileName} subido exitosamente. Total registros: ${result.totalRegistros}`);
                    // Reset form after successful upload
                    setFileName('');
                    setSelectedType('');
                    if (fileInput) fileInput.value = '';
                } else {
                    alert(`Error: ${result.message}`);
                }
            }
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            alert('Ocurrió un error al subir el archivo');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (selectedType && fileName) {
            handleSubmit();
        }
    }, [selectedType, fileName]);

    return (
        <div className="uploader-container">
            <div className="uploader-content">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as TipoNombre)}
                    className="type-select"
                >
                    <option value="">Selecciona un tipo</option>
                    <option value="PROFESIONAL 2025-1">PROFESIONAL</option>
                    <option value="TECNICO">TÉCNICO</option>
                    <option value="ESPECIALIZACION">ESPECIALIZACIÓN</option>
                </select>
                
                <div className="file-upload">
                    <label htmlFor="excel-upload" className="upload-label">
                        <Upload className="upload-icon" />
                        <span>Subir archivo</span>
                        <input
                            type="file"
                            id="excel-upload"
                            className="file-input"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                        />
                    </label>
                    {fileName && <p className="file-name">Archivo: {fileName}</p>}
                </div>

                {isSubmitting && <p>Enviando archivo...</p>}
            </div>
        </div>
    );
};

export default ExcelUploader;