import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Service } from '../../../../shared/Workflow';

interface NodeData {
  label: string;
  service: Service | undefined;
  status?: 'pending' | 'success' | 'error';
  description?: string;
}

export default memo(({ data }: { data: NodeData, isConnectable: boolean }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'success':
        return 'bg-green-100 border-green-200';
      case 'error':
        return 'bg-red-100 border-red-200';
      case 'pending':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`
      rounded-md
      border
      shadow-sm
      text-sm
      px-2
      py-1
      ${getStatusColor()}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {data.service ? (
              <div className="text-gray-400">
                <img src={data.service.image} alt={data.service.name} className="w-full h-4 object-cover" />
              </div>
            ) : (
              <div className="text-gray-400">
                AA
              </div>
            )}
            <div className="font-medium text-sm text-gray-900">
              {data.label}
            </div>
          </div>
        </div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1">
            {data.description}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
});