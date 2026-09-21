import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { TaskFilterParams, TaskStatus, TaskPriority } from '../types';

export const useTaskFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilterParams = useMemo(() => {
    return {
      status: (searchParams.get('status') as TaskStatus) || '',
      priority: (searchParams.get('priority') as TaskPriority) || '',
      dueStart: searchParams.get('dueStart') || '',
      dueEnd: searchParams.get('dueEnd') || '',
      projectId: searchParams.get('projectId') || '',
      isOverdue: searchParams.get('isOverdue') === 'true' ? true : searchParams.get('isOverdue') === 'false' ? false : '',
      search: searchParams.get('search') || '',
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof TaskFilterParams, value: any) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.dueStart) count++;
    if (filters.dueEnd) count++;
    if (filters.projectId) count++;
    if (filters.isOverdue !== '') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
  };
};
