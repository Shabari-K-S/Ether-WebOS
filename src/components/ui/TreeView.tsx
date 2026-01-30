import React, { useState } from 'react';
import {
    ChevronRight,
    Folder,
    FolderOpen,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TreeNode {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: TreeNode[];
    type?: 'folder' | 'file';
    meta?: string;
}

export interface TreeViewProps {
    data: TreeNode[];
    className?: string;
    onSelect?: (node: TreeNode) => void;
    onContextMenu?: (e: React.MouseEvent, node: TreeNode) => void;
    defaultExpanded?: string[];
}

const TreeNodeItem = ({ node, level = 0, onSelect, onContextMenu, expandedNodes, toggleExpand, selectedId }: {
    node: TreeNode;
    level?: number;
    onSelect?: (node: TreeNode) => void;
    onContextMenu?: (e: React.MouseEvent, node: TreeNode) => void;
    expandedNodes: Set<string>;
    toggleExpand: (id: string) => void;
    selectedId?: string;
}) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    const getIcon = () => {
        if (node.icon) return node.icon;
        if (node.children) return isExpanded ? <FolderOpen className="w-4 h-4 text-accent" /> : <Folder className="w-4 h-4 text-accent/70" />;
        return <FileText className="w-4 h-4 text-gray-500" />;
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        if (onContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu(e, node);
        }
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-colors group",
                    isSelected ? "bg-accent/10" : "hover:bg-white/5"
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent parent clicks
                    if (hasChildren) toggleExpand(node.id);
                    onSelect?.(node);
                }}
                onContextMenu={handleContextMenu}
            >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className={cn(
                        "w-4 h-4 flex items-center justify-center transition-transform",
                        hasChildren ? (isExpanded ? "rotate-90" : "rotate-0") : "opacity-0"
                    )}>
                        {hasChildren && <ChevronRight className="w-3 h-3 text-gray-400" />}
                    </span>

                    <span className="flex-shrink-0">
                        {getIcon()}
                    </span>

                    <span className={cn(
                        "text-sm truncate transition-colors",
                        isSelected ? "text-accent font-medium" : "text-gray-300 group-hover:text-white"
                    )}>
                        {node.label}
                    </span>

                    {node.meta && (
                        <span className="ml-auto text-xs text-gray-600 group-hover:text-gray-500">{node.meta}</span>
                    )}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map((child) => (
                            <TreeNodeItem
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                                onContextMenu={onContextMenu}
                                expandedNodes={expandedNodes}
                                toggleExpand={toggleExpand}
                                selectedId={selectedId}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const TreeView = ({ data, className, onSelect, onContextMenu, defaultExpanded = [] }: TreeViewProps) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpanded));
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNodes(newExpanded);
    };

    const handleSelect = (node: TreeNode) => {
        setSelectedId(node.id);
        onSelect?.(node);
    };

    return (
        <div className={cn("w-full p-2 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm", className)}>
            {data.map((node) => (
                <TreeNodeItem
                    key={node.id}
                    node={node}
                    onSelect={handleSelect}
                    onContextMenu={onContextMenu}
                    expandedNodes={expandedNodes}
                    toggleExpand={toggleExpand}
                    selectedId={selectedId}
                />
            ))}
        </div>
    );
};
