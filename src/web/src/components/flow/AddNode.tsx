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
  return (
    <div className={`
      rounded-md
      border
      shadow-sm
      text-sm
      px-2
      py-1
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            AA
          </div>
        </div>
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