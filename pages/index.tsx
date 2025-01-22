import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import TodoList from '@/components/TodoList'
import Notifications from '@/components/Notifications'
import TaskFilters from '@/components/TaskFilters'
import { useEffect, useState, useCallback} from 'react'

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all') // Filter state: all, assigned_to_me, created_by_me, overdue, due_today

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('auth.users').select('id, email')
    if (error) {
      console.error('Error fetching users:', error.message)
    } else {
      setUsers(data)
    }
  }

  return (
    <>
      <Head>
        <title>Todo App with Supabase</title>
        <meta name="description" content="Enhanced Todo List with Supabase" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full h-full bg-200">
        {!session ? (
          <div className="min-w-full min-h-screen flex items-center justify-center">
            <div className="w-full h-full flex justify-center items-center p-4">
              <div className="w-full h-full sm:h-auto sm:w-2/5 max-w-sm p-5 bg-white shadow flex flex-col text-base">
                <span className="font-sans text-4xl text-center pb-2 mb-1 border-b mx-4 align-center">
                  Login
                </span>
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col justify-center items-center p-4"
            style={{ minWidth: 250, maxWidth: 600, margin: 'auto' }}
          >
            {/* Notifications Component */}
            <Notifications session={session} />
            {/* Task Filters */}
            <TaskFilters onFilterChange={setFilter} />
            {/* Todo List */}
            <TodoList session={session} filter={filter} users={users} />
            <button
              className="btn-black w-full mt-12"
              onClick={async () => {
                const { error } = await supabase.auth.signOut()
                if (error) console.log('Error logging out:', error.message)
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
