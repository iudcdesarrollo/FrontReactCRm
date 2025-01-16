import React from 'react';

const KanbanBoard: React.FC = () => {
    return (
        <div className="flex p-4 h-full gap-4">
            <div className="flex-1 bg-gray-100 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4">To Do</h2>
                {/* List of tasks will go here */}
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4">In Progress</h2>
                {/* List of tasks will go here */}
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-4">Done</h2>
                {/* List of tasks will go here */}
            </div>
        </div>
    );
};

export default KanbanBoard;