import { Database } from '@/lib/schema'
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

type Todos = Database['public']['Tables']['todos']['Row']
type Users = { id: string; email: string }

export default function TodoList({ session, filter, users }: { session: Session; filter: string; users: Users[] }) {
  const supabase = useSupabaseClient<Database>()
  const [todos, setTodos] = useState<Todos[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errorText, setErrorText] = useState('')

  const user = session.user

  useEffect(() => {
    const fetchTodos = async () => {
      let query = supabase
        .from('todos')
        .select('id, inserted_at, task, user_id, is_complete, due_date, assigned_to') // Include due_date and assigned_to
        .order('id', { ascending: true })

      if (filter === 'assigned_to_me') {
        query = query.eq('assigned_to', user.id)
      } else if (filter === 'created_by_me') {
        query = query.eq('user_id', user.id)
      } else if (filter === 'overdue') {
        query = query.lt('due_date', new Date().toISOString().split('T')[0])
      } else if (filter === 'due_today') {
        query = query.eq('due_date', new Date().toISOString().split('T')[0])
      }

      const { data, error } = await query
      if (error) {
        console.error('Error fetching todos:', error.message)
      } else {
        setTodos(data || [])
      }
    }

    fetchTodos()
  }, [supabase, filter, user.id])

  const addTodo = async () => {
    const task = newTaskText.trim()
    if (task.length) {
      const { data: todo, error } = await supabase
        .from('todos')
        .insert({ task, user_id: user.id, assigned_to: assignedTo, due_date: dueDate })
        .select()
        .single()

      if (error) {
        setErrorText(error.message)
      } else {
        setTodos([...todos, todo])
        setNewTaskText('')
        setAssignedTo('')
        setDueDate('')
      }
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from('todos').delete().eq('id', id).throwOnError()
      setTodos(todos.filter((x) => x.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return (
    <div className="w-full">
      <h1 className="mb-12">Todo List with Enhanced Features</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo()
        }}
        className="flex flex-col gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="Task Title"
          value={newTaskText}
          onChange={(e) => {
            setErrorText('')
            setNewTaskText(e.target.value)
          }}
        />
        <select
          className="rounded w-full p-2"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="" disabled>
            Assign to User
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <input
          className="rounded w-full p-2"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="btn-black" type="submit">
          Add Task
        </button>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {todos.map((todo) => (
            <Todo key={todo.id} todo={todo} onDelete={() => deleteTodo(todo.id)} />
          ))}
        </ul>
      </div>
    </div>
  )
}

const Todo = ({ todo, onDelete }: { todo: Todos; onDelete: () => void }) => {
  const supabase = useSupabaseClient<Database>()
  const [isCompleted, setIsCompleted] = useState<boolean>(todo.is_complete || false) // Default to false

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from('todos')
        .update({ is_complete: !isCompleted })
        .eq('id', todo.id)
        .throwOnError()
        .select()
        .single()

      if (data) setIsCompleted(data.is_complete)
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="text-sm leading-5 font-medium truncate">{todo.task}</div>
          {todo.due_date && (
            <div className="text-xs text-gray-500">Due: {new Date(todo.due_date).toLocaleDateString()}</div>
          )}
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={() => toggle()}
            type="checkbox"
            checked={isCompleted || false} // Convert null to false
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="gray">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  )
}

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
)
