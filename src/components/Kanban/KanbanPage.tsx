import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './KanbanBoard';
import LeadFilter from './components/LeadFilter';
import { Lead, ManagementCount } from '../types';
import { Socket } from 'socket.io-client';
import { useKanbanStore } from './store/kanbanStore';

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
            updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
        });
    }, [updateTaskListByTipoGestion]);

    useEffect(() => {
        if (leads.length > 0) {
            setCurrentLeads(leads);
            clearStore();
            updateLeads(leads);
        }
    }, [leads]);

    const handleLeadsFiltered = useCallback((newFilteredLeads: Lead[]) => {
        clearStore();
        setCurrentLeads(newFilteredLeads);
        updateLeads(newFilteredLeads);
    }, [clearStore, updateLeads]);

    return (
        <div className="kanban-page">
            <LeadFilter onLeadsFiltered={handleLeadsFiltered} />
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