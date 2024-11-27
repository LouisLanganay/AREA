import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface NodeData {
}

export default memo(({ data }: { data: NodeData, isConnectable: boolean }) => {
  return (
    <div className={`
      rounded-md
      bg-white
      border
      shadow-sm
      text-sm
      px-2
      py-1
      w-[70px]
    `}>
      <div className="flex items-center">
        <PlusCircleIcon className='w-4 h-4 mr-2' />
        Add
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