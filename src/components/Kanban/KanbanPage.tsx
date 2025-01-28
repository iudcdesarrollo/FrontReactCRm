import React, { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import LeadFilter from './components/LeadFilter';
import { Lead } from '../types';
import { Socket } from 'socket.io-client';
import { useKanbanStore } from './store/kanbanStore';

interface KanbanPageProps {
    soket: Socket | null;
    leads?: Lead[];
}

export const KanbanPage: React.FC<KanbanPageProps> = ({ leads = [], soket }) => {
    const [currentLeads, setCurrentLeads] = useState<Lead[]>([]);
    const { clearStore, updateTaskListByTipoGestion } = useKanbanStore();
    

    useEffect(() => {
        setCurrentLeads(leads);
        leads.forEach(lead => {
            //console.log(JSON.stringify(lead.numeroWhatsapp));
            //console.log(JSON.stringify(lead.TipoGestion));
            //console.log(JSON.stringify(lead.nombre));
            updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
        });
    }, [leads, updateTaskListByTipoGestion, soket]);

    const handleLeadsFiltered = (newFilteredLeads: Lead[]) => {
        // console.log('Filtrando Leads - Nuevos Leads filtrados:', newFilteredLeads);

        clearStore();
        setCurrentLeads(newFilteredLeads);
        newFilteredLeads.forEach(lead => {
            // console.log(`numero de lead: ${lead.numeroWhatsapp}`);
            updateTaskListByTipoGestion(lead.numeroWhatsapp, lead.TipoGestion, lead.nombre);
        });
    };

    return (
        <div className="kanban-page">
            <LeadFilter onLeadsFiltered={handleLeadsFiltered} />
            <KanbanBoard
                leads={currentLeads}
                soket={soket}
            />
        </div>
    );
};

export default KanbanPage;