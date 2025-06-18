import { NavItem } from "./NavItem"

interface SideNavProps {
    onSetIngestForm: () => void;
    onSetDocEmbedForm: () => void;
    onSetUrlEntryForm: () => void; 
    onSetSearchForm: () => void;
    onSetReadyToChat: () => void;
}

const navItems = [
    {
        icon: "bi-body-text",
        tooltip: "Upload Text",
        action: "ingest"
    },
    {
        icon: "bi-file-earmark-arrow-up", 
        tooltip: "Upload PDF File",
        action: "docEmbed"
    },
    {
        icon: "bi-globe2",
        tooltip: "Upload a Webpage Content", 
        action: "urlEntry"
    },
    {
        icon: "bi-search",
        tooltip: "Upload Web Search Result",
        action: "search"
    },
    {
        icon: "bi-chat-text",
        tooltip: "Chat to Corpus",
        action: "chat"
    }
];

export const RetrievalSideNav = ({
    onSetIngestForm,
    onSetDocEmbedForm, 
    onSetUrlEntryForm,
    onSetSearchForm,
    onSetReadyToChat
}: SideNavProps) => {
    const handleClick = (action: string) => {
        switch(action) {
        case 'ingest':
            onSetIngestForm();
            break;
        case 'docEmbed':
            onSetDocEmbedForm();
            break;
        case 'urlEntry':
            onSetUrlEntryForm();
            break;
        case 'search':
            onSetSearchForm();
            break;
        case 'chat':
            onSetReadyToChat();
            break;
        }
    };

    return (
        <div className="flex grow-0 gap-2 ml-2.5 border-r border-slate-300 h-screen">
            <ul>
                {navItems.map((item) => (
                <NavItem
                    key={item.action}
                    icon={item.icon}
                    tooltip={item.tooltip}
                    onClick={() => handleClick(item.action)}
                />
                ))}
            </ul>
        </div>
    );
};