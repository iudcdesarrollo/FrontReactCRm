import React, { useState, KeyboardEvent } from 'react';
import axios, { AxiosError } from 'axios';
import './css/VentaPerdidaDesplegable.css';

interface Option {
    value: string;
    label: string;
}

interface VentaPerdidaDesplegableProps {
    telefono: string;
}

interface ServerError {
    message: string;
    status?: number;
}

interface ServerResponse {
    status: number;
    data: {
        message?: string;
    };
}

const enpointGeneral = import.meta.env.VITE_API_URL_GENERAL;

const colombianCities = [
    'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta',
    'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
    'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar',
    'Montería', 'Sincelejo', 'Popayán', 'Tunja', 'Riohacha',
    'Quibdó', 'Florencia', 'Yopal', 'Mocoa', 'San José del Guaviare',
    'Mitú', 'Puerto Carreño', 'Inírida', 'Leticia'
].sort();

const VentaPerdidaDesplegable: React.FC<VentaPerdidaDesplegableProps> = ({ telefono }) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const options: Option[] = [
        { value: 'no-vive-en-bogota', label: 'No vive en Bogotá' },
        { value: 'otra-universidad', label: 'Otra Universidad' },
        { value: 'homologacion', label: 'Homologación' },
        { value: 'horarios', label: 'Horarios' },
        { value: 'ubicacion-sedes', label: 'Ubicación-sedes' },
        { value: 'precios', label: 'Precios' },
        { value: 'virtualidad', label: 'Virtualidad' },
        { value: 'colgo-la-llamada', label: 'Colgó la llamada' },
        { value: 'no-contesto', label: 'No contestó' },
        { value: 'no-interesado', label: 'No interesado' },
        { value: 'datos-incompletos', label: 'Datos incompletos' },
        { value: 'no-solicito-informacion', label: 'No solicitó información' },
        { value: 'numero-equivocado', label: 'Número equivocado' },
        { value: 'imposible-contacto', label: 'Imposible contacto' },
        { value: 'no-es-bachiller', label: 'No es bachiller' },
        { value: 'numero-invalido', label: 'Número inválido' },
        { value: 'informacion-para-tercero', label: 'La información es para un tercero' },
        { value: 'no-cumple-requisitos', label: 'No cumple con los requisitos' },
        { value: 'razon-no-definida', label: 'Razón no definida' },
    ];

    const sendToServer = async (reason: string, city?: string) => {
        try {
            const finalReason = city
                ? `No vive en Bogotá - Ciudad: ${city}`
                : reason;

            const response = await axios.post<ServerResponse>(`${enpointGeneral}/addRazonVentaPerdida`, {
                telefono,
                ventaPerdidaRazon: finalReason
            });

            if (response.status === 200) {
                console.log('Razón de venta perdida actualizada exitosamente');
                setError(null);
                setIsSubmitted(true);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ServerError>;
            console.error('Error al enviar la razón:', axiosError);
            setError(axiosError.response?.data?.message || 'Error al actualizar la razón');
            setIsSubmitted(false);
            if (selectedOption === 'razon-no-definida') {
                setCustomReason('');
            }
        }
    };

    const handleButtonClick = () => {
        setIsButtonEnabled(true);
    };

    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedOption(value);
        setIsSubmitted(false);
        setSelectedCity('');

        if (value !== 'razon-no-definida' && value !== 'no-vive-en-bogota') {
            setIsButtonEnabled(false);
            await sendToServer(value);
        }
    };

    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        setSelectedCity(city);
        if (city) {
            await sendToServer('no-vive-en-bogota', city);
        }
    };

    const handleCustomReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomReason(e.target.value);
        setIsSubmitted(false);
    };

    const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customReason.trim()) {
            setIsButtonEnabled(false);
            setIsSubmitted(true);
            await sendToServer(customReason.trim());
        }
    };

    const shouldShowServerMessage = selectedOption && (
        (selectedOption !== 'razon-no-definida' && selectedOption !== 'no-vive-en-bogota') ||
        (selectedOption === 'no-vive-en-bogota' && selectedCity && isSubmitted) ||
        (selectedOption === 'razon-no-definida' && isSubmitted)
    );

    return (
        <div className="venta-perdida-container">
            <p>Seleccione la Razón de Venta Perdida</p>

            <div className="control-container">
                {!isButtonEnabled && !selectedOption && (
                    <button
                        onClick={handleButtonClick}
                        className="activate-button"
                    >
                        Activar Desplegable
                    </button>
                )}

                {(isButtonEnabled || selectedOption) && (
                    <div className={`select-wrapper ${selectedOption && selectedOption !== 'razon-no-definida' && selectedOption !== 'no-vive-en-bogota' ? 'disabled' : ''}`}>
                        <select
                            id="ventaPerdida"
                            value={selectedOption || ''}
                            onChange={handleSelectChange}
                            disabled={selectedOption !== null && selectedOption !== 'razon-no-definida' && selectedOption !== 'no-vive-en-bogota'}
                        >
                            <option value="" disabled>
                                Seleccione una opción
                            </option>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedOption === 'no-vive-en-bogota' && !isSubmitted && (
                    <div className="select-wrapper city-select">
                        <select
                            value={selectedCity}
                            onChange={handleCityChange}
                            className="city-dropdown"
                        >
                            <option value="" disabled>
                                Seleccione una ciudad
                            </option>
                            {colombianCities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {selectedOption === 'razon-no-definida' && !isSubmitted && (
                <div className="custom-reason-container">
                    <input
                        type="text"
                        placeholder="Escriba la razón..."
                        value={customReason}
                        onChange={handleCustomReasonChange}
                        onKeyPress={handleKeyPress}
                        className="custom-reason-input"
                        autoFocus
                    />
                </div>
            )}

            {shouldShowServerMessage && !error && (
                <p className="selected-option">
                    Se informa al server: <strong>
                        {selectedOption === 'razon-no-definida'
                            ? customReason
                            : selectedOption === 'no-vive-en-bogota'
                                ? `No vive en Bogotá - Ciudad: ${selectedCity}`
                                : selectedOption}
                    </strong>
                </p>
            )}

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}
        </div>
    );
};

export default VentaPerdidaDesplegable;