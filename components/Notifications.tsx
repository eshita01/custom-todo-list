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

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
