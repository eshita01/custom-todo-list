import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/schema'

type Notification = Database['public']['Tables']['notifications']['Row']

export default function Notifications({ userId }: { userId: string }) {
  const supabase = useSupabaseClient<Database>()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching notifications:', error)
      else setNotifications(data || [])
    }

    fetchNotifications()

    const subscription = supabase
      .from(`notifications:user_id=eq.${userId}`)
      .on('INSERT', (payload) => {
        setNotifications((prev) => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeSubscription(subscription)
    }
  }, [supabase, userId])

  return (
    <div className="notification-container">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id} className={notif.is_read ? '' : 'font-bold'}>
            {notif.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
