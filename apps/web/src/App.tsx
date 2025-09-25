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
import { listCanvases, getCanvas, createCanvas, saveCanvas, type CanvasSummary } from './services/canvases';
import { useAuthStore } from './store/auth';

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
  const [canvases, setCanvases] = React.useState<CanvasSummary[]>([]);
  const [activeCanvasId, setActiveCanvasId] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'saved' | 'saving' | 'error'>('saved');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const logout = useAuthStore((s) => s.logout);

  // Handle text node size changes
  const handleTextNodeSizeChange = useCallback((nodeId: string, newSize: { width: number; height: number }) => {
    setNodes((nds: Node[]) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, width: newSize.width, height: newSize.height } }
          : n
      )
    );
  }, [setNodes]);

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

  // Load canvas list & default canvas
  React.useEffect(() => {
    (async () => {
      try {
        const list = await listCanvases();
        setCanvases(list);
        if (list.length) {
          setActiveCanvasId(list[0].id);
          const data = await getCanvas(list[0].id);
          if (data) {
            setNodes(data.nodes as Node[]);
            setEdges(data.edges as Edge[]);
          }
        }
      } catch (_) {
        // noop
      }
    })();
  }, [setNodes, setEdges]);

  // Debounced autosave when nodes/edges change
  React.useEffect(() => {
    if (!activeCanvasId) return;
    setSaveStatus('saving');
    const h = setTimeout(async () => {
      try {
        await saveCanvas(activeCanvasId, { nodes, edges });
        setSaveStatus('saved');
      } catch (_) {
        setSaveStatus('error');
      }
    }, 800);
    return () => clearTimeout(h);
  }, [nodes, edges, activeCanvasId]);

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
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-3 items-center">
          {/* Left: Brand */}
          <div className="justify-self-start">
            <h1 className="text-xl font-semibold text-gray-900">Mapin - Process Mapper</h1>
          </div>

          {/* Center: Canvas selector */}
          <div className="justify-self-center">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[200px]"
              value={activeCanvasId ?? ''}
              onChange={async (e) => {
                const id = e.target.value || null;
                setActiveCanvasId(id);
                if (id) {
                  const data = await getCanvas(id);
                  if (data) {
                    setNodes(data.nodes as Node[]);
                    setEdges(data.edges as Edge[]);
                  }
                }
              }}
            >
              {canvases.length === 0 && <option value="">No canvases</option>}
              {canvases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Right: New, status, and menu */}
          <div className="justify-self-end flex items-center gap-2 relative">
            <button
              onClick={async () => {
                const title = prompt('Name your canvas', 'Untitled');
                if (!title) return;
                const id = await createCanvas(title);
                const list = await listCanvases();
                setCanvases(list);
                setActiveCanvasId(id);
                setNodes([]);
                setEdges([]);
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
            >
              New
            </button>
            <span className="text-xs text-gray-500 min-w-[60px] text-right">
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && 'Save failed'}
            </span>

            {/* Actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Menu
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSave();
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLoad();
                    }}
                  >
                    Load
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      handleReset();
                    }}
                  >
                    Reset
                  </button>
                  <div className="h-px bg-gray-200 my-1" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Shape Palette */}
        <ShapePalette onShapeSelect={onShapeSelect} />

        {/* Canvas Area */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes.map((node: Node) => 
              node.type === 'text' 
                ? { ...node, data: { ...node.data, onSizeChange: handleTextNodeSizeChange } }
                : node
            )}
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