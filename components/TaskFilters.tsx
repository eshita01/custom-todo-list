import React from 'react'

interface TaskFiltersProps {
  filter: string
  setFilter: (filter: string) => void
}

export default function TaskFilters({ filter, setFilter }: TaskFiltersProps) {
  return (
    <div className="task-filters">
      <h2>Filters</h2>
      <div className="flex gap-2">
        <button
          className={`btn-black-outline ${filter === 'all' ? 'bg-black text-white' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`btn-black-outline ${filter === 'assigned_to_me' ? 'bg-black text-white' : ''}`}
          onClick={() => setFilter('assigned_to_me')}
        >
          Assigned to Me
        </button>
        <button
          className={`btn-black-outline ${filter === 'created_by_me' ? 'bg-black text-white' : ''}`}
          onClick={() => setFilter('created_by_me')}
        >
          Created by Me
        </button>
        <button
          className={`btn-black-outline ${filter === 'overdue' ? 'bg-black text-white' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </button>
        <button
          className={`btn-black-outline ${filter === 'due_today' ? 'bg-black text-white' : ''}`}
          onClick={() => setFilter('due_today')}
        >
          Due Today
        </button>
      </div>
    </div>
  )
}
