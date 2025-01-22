import { Database } from '@/lib/schema'
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

type Todos = {
  id: number
  task: string
  user_id: string
  is_complete: boolean
  assigned_date: string | null
  assigned_to: { id: string; email: string } | null
  assigned_to_email?: string
}

type Users = { id: string; email: string }

export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>()
  const [todos, setTodos] = useState<Todos[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [assignedDate, setAssignedDate] = useState<string>('')
  const [errorText, setErrorText] = useState('')
  const [users, setUsers] = useState<Users[]>([])

  const user = session.user

  useEffect(() => {
    const fetchTodos = async () => {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('id, task, user_id, is_complete, assigned_date, assigned_to!inner (id, email)')
        .order('id', { ascending: true })

      if (error) {
        console.log('error', error)
      } else {
        const formattedTodos = todos.map((todo) => ({
          ...todo,
          assigned_to_email: todo.assigned_to?.email || 'N/A',
        }))
        setTodos(formattedTodos as Todos[])
      }
    }

    const fetchUsers = async () => {
      const { data: users, error } = await supabase.from('users').select('*')
      if (error) console.log('error', error)
      else setUsers(users as Users[])
    }

    fetchTodos()
    fetchUsers()
  }, [supabase])

  const addTodo = async (taskText: string) => {
    let task = taskText.trim()
    if (task.length && assignedTo && assignedDate) {
      const { data: todo, error } = await supabase
        .from('todos')
        .insert({
          task,
          user_id: user.id,
          assigned_to: assignedTo,
          assigned_date: assignedDate,
        })
        .select('id, task, user_id, is_complete, assigned_date, assigned_to!inner (id, email)')
        .single()

      if (error) {
        setErrorText(error.message)
      } else {
        setTodos([...todos, { ...todo, assigned_to_email: todo.assigned_to?.email || 'N/A' }])
        setNewTaskText('')
        setAssignedTo('')
        setAssignedDate('')
      }
    } else {
      setErrorText('Please fill in all fields')
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from('todos').delete().eq('id', id).throwOnError()
      setTodos(todos.filter((x) => x.id != id))
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className="w-full">
      <h1 className="mb-12">Todo List.</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo(newTaskText)
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="make coffee"
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
          <option value="">Assign To</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
        <input
          className="rounded w-full p-2"
          type="date"
          value={assignedDate}
          onChange={(e) => setAssignedDate(e.target.value)}
        />
        <button className="btn-black" type="submit">
          Add
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
  const [isCompleted, setIsCompleted] = useState(todo.is_complete)

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
      console.log('error', error)
    }
  }

  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">{todo.task}</div>
          <div className="text-sm text-gray-600 ml-2">
            Assigned to: {todo.assigned_to_email} | Due Date: {todo.assigned_date || 'N/A'}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => toggle()}
            type="checkbox"
            checked={isCompleted ? true : false}
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
