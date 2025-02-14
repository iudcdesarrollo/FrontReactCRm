import Split from "react-split";
import SidebarPanel from "../../SidebarPanel";

const FacebookComments = () => {
    return (
        <Split
            className="flex h-screen bg-gray-100"
            sizes={[25, 75]}
            minSize={200}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
        >
            <SidebarPanel
                searchTerm=""
                currentCategory="Todos"
                filteredLeads={[]}
                selectedChat={null}
                setSelectedChat={() => {}}
                handleSearch={() => {}}
                handleCategoryChange={() => {}}
                Categries={false}
            />
            <div className="flex-1 bg-gray-50">
                <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400 text-lg">
                        Selecciona una conversación
                    </span>
                </div>
            </div>
        </Split>
    );
};

export default FacebookComments;