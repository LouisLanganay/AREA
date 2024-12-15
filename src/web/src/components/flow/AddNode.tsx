import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface NodeData {
  onAdd?: (nodeId: string) => void;
  parentId: string;
}

export default memo(({ data }: { data: NodeData, isConnectable: boolean }) => {
  return (
    <div
      className={`
        rounded-md
        bg-card
        border
        shadow-sm
        text-sm
        px-2
        py-1
        w-[70px]
        cursor-pointer
        hover:bg-muted/50
        transition-colors
      `}
      onClick={() => data.onAdd?.(data.parentId)}
    >
      <div className="flex items-center">
        <PlusCircleIcon className='w-4 h-4 mr-2' />
        Add
      </div>

      <Handle
        type='target'
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
});
