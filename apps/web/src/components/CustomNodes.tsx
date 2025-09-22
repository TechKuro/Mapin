import React, { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

// Rectangle/Process Node
export const RectangleNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="px-4 py-2 border-2 border-blue-500 bg-white rounded shadow-md min-w-[120px]">
      <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} />
      <div className="text-sm font-medium text-gray-900 text-center">
        {data?.label || 'Process'}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
    </div>
  );
};

// Diamond/Decision Node
export const DiamondNode: React.FC<NodeProps> = ({ data, isConnectable }) => (
  <div className="relative">
    {/* Diamond body via a rotated square so border renders */}
    <div className="w-28 h-28 flex items-center justify-center overflow-visible">
      <div
        className="w-full h-full bg-white border-2 border-yellow-600 shadow-md flex items-center justify-center"
        style={{ transform: 'rotate(45deg) scale(0.7071)' }}
      >
        <span
          className="text-sm font-semibold text-gray-900 text-center px-1"
          style={{ transform: 'rotate(-45deg) scale(1.4142)' }}
        >
          {data?.label || 'Decision'}
        </span>
      </div>
    </div>

    {/* Handles - positioned after the diamond body to ensure proper z-index */}
    <Handle 
      type="target" 
      position={Position.Top} 
      id="top" 
      isConnectable={isConnectable}
      style={{ zIndex: 10 }}
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      id="right" 
      isConnectable={isConnectable}
      style={{ zIndex: 10 }}
    />
    <Handle 
      type="source" 
      position={Position.Bottom} 
      id="bottom" 
      isConnectable={isConnectable}
      style={{ zIndex: 10 }}
    />
    <Handle 
      type="source" 
      position={Position.Left} 
      id="left" 
      isConnectable={isConnectable}
      style={{ zIndex: 10 }}
    />
  </div>
);

// Ellipse/Start-End Node
export const EllipseNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="top" isConnectable={isConnectable} />
      <div className="w-28 h-16 border-2 border-green-500 bg-white rounded-full shadow-md flex items-center justify-center">
        <div className="text-sm font-medium text-gray-900 text-center px-2">
          {data?.label || 'Start/End'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={isConnectable} />
    </div>
  );
};

// Text/Annotation Node with resize capability
export const TextNode: React.FC<NodeProps> = ({ data, isConnectable, id }) => {
  const [size, setSize] = useState({ 
    width: data?.width || 200, 
    height: data?.height || 60 
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Update size when data changes
  React.useEffect(() => {
    setSize({ 
      width: data?.width || 200, 
      height: data?.height || 60 
    });
  }, [data?.width, data?.height]);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeHandle(handle);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle) return;

      const deltaX = e.movementX;
      const deltaY = e.movementY;

      setSize((prevSize: { width: number; height: number }) => {
        let newWidth = prevSize.width;
        let newHeight = prevSize.height;

        switch (resizeHandle) {
          case 'se': // Southeast (bottom-right)
            newWidth = Math.max(100, prevSize.width + deltaX);
            newHeight = Math.max(40, prevSize.height + deltaY);
            break;
          case 'sw': // Southwest (bottom-left)
            newWidth = Math.max(100, prevSize.width - deltaX);
            newHeight = Math.max(40, prevSize.height + deltaY);
            break;
          case 'ne': // Northeast (top-right)
            newWidth = Math.max(100, prevSize.width + deltaX);
            newHeight = Math.max(40, prevSize.height - deltaY);
            break;
          case 'nw': // Northwest (top-left)
            newWidth = Math.max(100, prevSize.width - deltaX);
            newHeight = Math.max(40, prevSize.height - deltaY);
            break;
        }

        return { width: newWidth, height: newHeight };
      });
    },
    [isResizing, resizeHandle]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    
    // Update the node data with the new size
    if (data?.onSizeChange) {
      data.onSizeChange(id, size);
    }
  }, [id, size, data]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative group">
      {/* Main text container */}
      <div
        className="px-3 py-2 bg-yellow-50 border border-gray-400 rounded text-sm text-gray-800 shadow-sm resize-none overflow-hidden"
        style={{
          width: size.width,
          height: size.height,
          minWidth: 100,
          minHeight: 40,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {data?.label || 'Text annotation'}
        </div>
      </div>

      {/* Resize handles - only show on hover */}
      <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto">
        {/* Corner resize handles */}
        <div
          className="absolute w-4 h-4 bg-black border-2 border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ bottom: -8, right: -8 }}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            handleMouseDown(e, 'se');
          }}
        />
        <div
          className="absolute w-4 h-4 bg-black border-2 border-white rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ bottom: -8, left: -8 }}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            handleMouseDown(e, 'sw');
          }}
        />
        <div
          className="absolute w-4 h-4 bg-black border-2 border-white rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ top: -8, right: -8 }}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            handleMouseDown(e, 'ne');
          }}
        />
        <div
          className="absolute w-4 h-4 bg-black border-2 border-white rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ top: -8, left: -8 }}
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            handleMouseDown(e, 'nw');
          }}
        />
      </div>
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