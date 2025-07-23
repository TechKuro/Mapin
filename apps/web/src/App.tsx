import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ShapePalette, { type ShapeType } from './components/ShapePalette';
import { nodeTypes } from './components/CustomNodes';

// Initial nodes for demonstration
const initialNodes = [
  {
    id: '1',
    type: 'ellipse',
    position: { x: 250, y: 100 },
    data: { label: 'Start' },
  },
  {
    id: '2',
    type: 'rectangle',
    position: { x: 400, y: 200 },
    data: { label: 'Process Data' },
  },
  {
    id: '3',
    type: 'diamond',
    position: { x: 600, y: 300 },
    data: { label: 'Valid?' },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
  },
];

let id = 3;
const getId = () => `${++id}`;

const FlowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const shapeType = event.dataTransfer.getData('application/reactflow') as ShapeType;

      if (typeof shapeType === 'undefined' || !shapeType) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type: shapeType,
        position,
        data: { label: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${id}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onShapeSelect = useCallback((shapeType: ShapeType) => {
    const newNode = {
      id: getId(),
      type: shapeType,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: { label: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${id}` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mapin - Process Mapper</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            Save
          </button>
          <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
            Load
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Shape Palette */}
        <ShapePalette onShapeSelect={onShapeSelect} />
        
        {/* Canvas Area */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            connectionLineType="smoothstep"
            defaultEdgeOptions={{ type: 'smoothstep' }}
          >
            <Background variant="dots" gap={20} size={1} />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#f3f4f6"
              nodeBorderRadius={2}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

export default App; 