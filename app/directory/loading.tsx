import { TableSkeleton } from '@/client/components/Skeletons';

export default function DirectoryLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading CSO directory">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-80 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-28 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="h-24 rounded-2xl bg-white border border-[#E5E7EB] p-4 animate-pulse" />
      <TableSkeleton rows={8} />
    </div>
  );
}
