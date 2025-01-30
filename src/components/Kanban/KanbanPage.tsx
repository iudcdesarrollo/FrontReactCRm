import React, { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import LeadFilter from './components/LeadFilter';
import { Lead, ManagementCount } from '../types';  // Make sure to import ManagementCount
import { Socket } from 'socket.io-client';
import { useKanbanStore } from './store/kanbanStore';

interface KanbanPageProps {
    soket: Socket | null;
    leads?: Lead[];
    managementCounts?: ManagementCount[];
    totalCount?: number;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({
    leads = [],
    soket,
    managementCounts,
    totalCount
}) => {
    const [currentLeads, setCurrentLeads] = useState<Lead[]>([]);
    const { clearStore, updateTaskListByTipoGestion } = useKanbanStore();

    useEffect(() => {
        setCurrentLeads(leads);
        leads.forEach(lead => {
            updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
        });
    }, [leads, updateTaskListByTipoGestion, soket]);

    const handleLeadsFiltered = (newFilteredLeads: Lead[]) => {
        clearStore();
        setCurrentLeads(newFilteredLeads);
        newFilteredLeads.forEach(lead => {
            updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
        });
    };

    return (
        <div className="kanban-page">
            <LeadFilter onLeadsFiltered={handleLeadsFiltered} />
            <KanbanBoard
                leads={currentLeads}
                soket={soket}
                managementCounts={managementCounts}
                totalCount={totalCount}
            />
        </div>
    );
};

export default KanbanPage;