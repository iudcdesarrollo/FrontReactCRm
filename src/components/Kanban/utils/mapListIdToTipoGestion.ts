export const mapListIdToTipoGestion = (listId: string): string => {
    const mappings: Record<string, string> = {
        'sinGestionar': 'sin gestionar',
        'conversacion': 'conversacion',
        'depurar': 'depuracion',
        'llamada': 'llamada',
        'segundaLlamada': 'segunda llamada',
        'estudiante': 'inscrito',
        'revision': 'venta perdida'
    };
    return mappings[listId] || 'sin gestionar';
};