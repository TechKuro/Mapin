import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

// Rectangle/Process Node
export const RectangleNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 border-2 border-blue-500 bg-white rounded shadow-md min-w-[120px]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="text-sm font-medium text-gray-900 text-center">
        {data?.label || 'Process'}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

// Diamond/Decision Node
export const DiamondNode: React.FC<NodeProps> = ({ data, isConnectable }) => (
  <div className="relative">
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} />

    {/* Diamond body */}
    <div
      className="w-28 h-28 flex items-center justify-center bg-white border-2 border-yellow-600 shadow-md"
      style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
    >
      <span className="text-xs font-medium text-gray-900 text-center px-1">
        {data?.label || 'Decision'}
      </span>
    </div>

    {/* Handles */}
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
  </div>
);

// Ellipse/Start-End Node
export const EllipseNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="w-28 h-16 border-2 border-green-500 bg-white rounded-full shadow-md flex items-center justify-center">
        <div className="text-sm font-medium text-gray-900 text-center px-2">
          {data?.label || 'Start/End'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

// Text/Annotation Node
export const TextNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-3 py-2 bg-yellow-50 border border-gray-400 rounded text-sm text-gray-800 shadow-sm max-w-[200px]">
      {data?.label || 'Text annotation'}
    </div>
  );
};

// Node type mapping
export const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  ellipse: EllipseNode,
  text: TextNode,
}; 