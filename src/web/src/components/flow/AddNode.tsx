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
        shadow-sm
        text-sm
        w-fit
        cursor-pointer
        transition-colors
        px-2
        group
      `}
      onClick={() => data.onAdd?.(data.parentId)}
    >
      <PlusCircleIcon className='size-5 fill-primary group-hover:scale-105 transition-all duration-300' />

      <Handle
        type='target'
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
});
