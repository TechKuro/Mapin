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
  type Node,
  type Edge,
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
  const reactFlowInstance = useReactFlow();

  // --- Undo / Redo --------------------------------------------------
  const undoStack = React.useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const redoStack = React.useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // push current state to undo stack whenever nodes or edges change
  React.useEffect(() => {
    undoStack.current.push({ nodes, edges });
    // clear redo stack on new action
    redoStack.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const undo = () => {
    if (undoStack.current.length > 1) {
      const current = undoStack.current.pop();
      if (current) redoStack.current.push(current);
      const prev = undoStack.current[undoStack.current.length - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
    }
  };

  const redo = () => {
    if (redoStack.current.length) {
      const next = redoStack.current.pop();
      if (next) {
        undoStack.current.push({ nodes: next.nodes, edges: next.edges });
        setNodes(next.nodes);
        setEdges(next.edges);
      }
    }
  };

  // --- Keyboard shortcuts -----------------------------------------
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && !event.repeat) {
        const currentNodes = reactFlowInstance.getNodes();
        const currentEdges = reactFlowInstance.getEdges();
        const remainingNodes = currentNodes.filter((n: Node) => !n.selected);
        const remainingEdges = currentEdges.filter((e: Edge) => !e.selected);
        if (remainingNodes.length !== currentNodes.length || remainingEdges.length !== currentEdges.length) {
          setNodes(remainingNodes);
          setEdges(remainingEdges);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reactFlowInstance, setNodes, setEdges]);

  // --- Inline editing ----------------------------------------------
  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const newLabel = prompt('Edit label', node.data?.label || '')?.trim();
      if (newLabel && newLabel.length > 0) {
        setNodes((nds: Node[]) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
          )
        );
      }
    },
    [setNodes],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connection attempt:', params);
      // Validate connection - prevent self-connections
      if (params.source === params.target) {
        console.log('Prevented self-connection');
        return;
      }
      setEdges((eds: Edge[]) => addEdge(params, eds));
    },
    [setEdges],
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
        data: {
          label: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${id}`,
        },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onShapeSelect = useCallback(
    (shapeType: ShapeType) => {
      const newNode = {
        id: getId(),
        type: shapeType,
        position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
        data: {
          label: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${id}`,
        },
      };
      setNodes((nds: Node[]) => nds.concat(newNode));
    },
    [setNodes],
  );

  const handleSave = useCallback(() => {
    const flowData = {
      nodes,
      edges,
    };
    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const loadedData = JSON.parse(e.target?.result as string);
            setNodes(loadedData.nodes);
            setEdges(loadedData.edges);
          } catch (error) {
            console.error('Error loading flow data:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges, initialNodes, initialEdges]);

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mapin - Process Mapper</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleLoad}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Load
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset
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
            panOnScroll
            zoomOnScroll
            panOnDrag
            snapToGrid
            snapGrid={[20, 20]}
            connectionLineType="smoothstep"
            defaultEdgeOptions={{ type: 'smoothstep' }}
            onNodeDoubleClick={handleNodeDoubleClick}
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