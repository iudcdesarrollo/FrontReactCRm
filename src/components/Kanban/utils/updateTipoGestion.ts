const enpoinyBasic = import.meta.env.VITE_API_URL_GENERAL;

export const updateTipoGestion = async (numeroWhatsapp: string, tipoGestion: string) => {
    try {
        const response = await fetch(`${enpoinyBasic}/UpdateTipoGestion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numero_cliente: numeroWhatsapp,
                tipo_gestion: tipoGestion
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update tipo gestion');
        }
    } catch (error) {
        console.error('Error updating tipo gestion:', error);
    }
};