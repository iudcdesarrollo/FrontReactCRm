import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './KanbanBoard';
import LeadFilter from './components/LeadFilter';
import { Lead, ManagementCount } from '../types';
import { Socket } from 'socket.io-client';
import { useKanbanStore } from './store/kanbanStore';
import { ProcessedLead } from './@types/LeadFilter';

interface KanbanPageProps {
    soket: Socket | null;
    leads?: Lead[];
    managementCounts?: ManagementCount[];
    totalCount?: number;
    role: string;
    email: string;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({
    leads = [],
    soket,
    managementCounts,
    totalCount,
    role,
    email
}) => {
    const [currentLeads, setCurrentLeads] = useState<Lead[]>([]);
    const { clearStore, updateTaskListByTipoGestion } = useKanbanStore();

    const updateLeads = useCallback((leadsToUpdate: Lead[]) => {
        leadsToUpdate.forEach(lead => {
            if (lead.numeroWhatsapp && lead.TipoGestion && lead.nombre) {
                updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
            }
        });
    }, [updateTaskListByTipoGestion]);

    useEffect(() => {
        if (leads.length > 0) {
            setCurrentLeads(leads);
            clearStore();
            updateLeads(leads);
        }
    }, [leads, clearStore, updateLeads]);

    const handleLeadsFiltered = useCallback((processedLeads: ProcessedLead[]) => {
        const convertedLeads: Lead[] = processedLeads.map(processedLead => ({
            id: processedLead.id,
            nombre: processedLead.nombre,
            numeroWhatsapp: processedLead.numeroWhatsapp,
            conversacion: processedLead.conversacion,
            urlPhotoPerfil: processedLead.urlPhotoPerfil,
            TipoGestion: processedLead.TipoGestion,
            messages: processedLead.messages.map(msg => ({
                Agente: msg.Agente,
                Cliente: msg.Cliente,
                message: msg.message,
                timestamp: msg.timestamp,
                id: msg.id,
                _id: msg._id,
                status: msg.status,
                messageType: msg.messageType
            })),
            profilePictureUrl: processedLead.urlPhotoPerfil // Mantenemos la consistencia usando urlPhotoPerfil
        }));

        clearStore();
        setCurrentLeads(convertedLeads);
        updateLeads(convertedLeads);
    }, [clearStore, updateLeads]);

    return (
        <div className="kanban-page">
            <LeadFilter 
                onLeadsFiltered={handleLeadsFiltered}
            />
            <KanbanBoard
                leads={currentLeads}
                soket={soket}
                managementCounts={managementCounts}
                totalCount={totalCount}
                role={role}
                email={email}
            />
        </div>
    );
};

export default KanbanPage;