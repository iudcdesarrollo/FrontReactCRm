export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Profesional {
    profesional: boolean;
    tecnico: boolean;
    especializacion: boolean;
    homologacion: boolean;
    observacionesPrincipales?: string;
    listasOficialesExcel?: string;
    aulaVirtualMoodle: boolean;
    controlCarlos: boolean;
    nConsecutivo: number | string;
    tareas: string;
    apellido1: string;
    apellido2?: string;
    nombre1: string;
    nombre2?: string;
    tipoDocumento: string;
    numeroIdentificacion: number | string;
    fechaNacimiento?: Date;
    numeroContacto?: number | string;
    correo?: string;
    periodoAcademico: string;
    programa: string;
    jornada?: string;
    archivoPagos?: string;
    icfes11: boolean;
    diplomaActa: boolean;
    copiaDocumentoIdentidad: boolean;
    certificadoEps: boolean;
    comprobantePago: boolean;
    valorPago?: number | string;
    fechaPago?: Date;
    nConfirmacionPago?: number | string;
    revision?: string;
    quienRealizo?: string;
    concepto?: string;
    egresado: boolean;
    carpeta: boolean;
    plataformaNotas: boolean;
    carnetFisico: boolean;
    fechaLegalizacionMatricula?: Date;
    comentarios?: string;
    estratoSocial?: string;
}

export interface TableResponse {
    success: boolean;
    data: Profesional[];
    pagination: PaginationInfo;
    filters: {
        tipo: string;
    };
}

export interface ProfesionalesTableProps {
    onRowClick?: (profesional: Profesional) => void;
}