import { memo } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { Handle, Position } from 'reactflow';

interface NodeData {
  onAdd?: (nodeId: string) => void;
  parentId: string;
}

export default memo(({ data }: { data: NodeData, isConnectable: boolean }) => {
  return (
    <div
      className='text-sm w-fit cursor-pointer transition-colors px-2 group'
      onClick={() => data.onAdd?.(data.parentId)}
      role="button"
      aria-label="Ajouter un nœud"
      tabIndex={0}
    >
      <PlusCircleIcon className='size-5 fill-primary group-hover:scale-105 transition-all duration-300 bg-background rounded-full'
        aria-hidden="true"
      />

      <Handle
        type='target'
        position={Position.Top}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
});
