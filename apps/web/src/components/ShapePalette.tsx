import React from 'react';

export type ShapeType = 'rectangle' | 'diamond' | 'ellipse' | 'text';

interface Shape {
  id: ShapeType;
  label: string;
  icon: string;
  description: string;
}

const shapes: Shape[] = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    icon: '⬜',
    description: 'Process step',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    icon: '◇',
    description: 'Decision point',
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    icon: '⬭',
    description: 'Start/End',
  },
  {
    id: 'text',
    label: 'Text',
    icon: 'T',
    description: 'Annotation',
  },
];

interface ShapePaletteProps {
  onShapeSelect: (shapeType: ShapeType) => void;
}

const ShapePalette: React.FC<ShapePaletteProps> = ({ onShapeSelect }) => {
  const onDragStart = (event: React.DragEvent, shapeType: ShapeType) => {
    event.dataTransfer.setData('application/reactflow', shapeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shapes</h2>
        
        <div className="space-y-2">
          {shapes.map((shape) => (
            <div
              key={shape.id}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={(event) => onDragStart(event, shape.id)}
              onClick={() => onShapeSelect(shape.id)}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-lg border border-gray-300">
                {shape.icon}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {shape.label}
                </div>
                <div className="text-xs text-gray-500">
                  {shape.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tips</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Drag shapes to canvas</li>
            <li>• Click to connect nodes</li>
            <li>• Delete with Del key</li>
            <li>• Pan with mouse wheel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShapePalette; 