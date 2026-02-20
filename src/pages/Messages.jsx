import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Navbar from '../components/common/Navbar'
import { messagesApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Spinner } from '../components/common/UI'
import toast from 'react-hot-toast'
import { Send, MessageSquare, Search, Wifi, WifiOff } from 'lucide-react'

let socket = null

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef(null)
  const selectedRef = useRef(null)

  useEffect(() => { selectedRef.current = selected }, [selected])

  useEffect(() => {
    if (!user) return

    socket = io('http://localhost:3000/messages', {
      auth: { userId: user.id },
      withCredentials: true,
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('newMessage', (msg) => {
      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId

      if (selectedRef.current?.userId === otherId || selectedRef.current?.userId === msg.senderId) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }

      setConversations(prev => {
        const existing = prev.find(c => c.userId === otherId)
        if (existing) {
          return prev.map(c => c.userId === otherId ? { ...c, lastMsg: msg } : c)
        } else {
          return [{ userId: otherId, messages: [msg], lastMsg: msg }, ...prev]
        }
      })
    })

    return () => { socket?.disconnect(); socket = null }
  }, [user])

  useEffect(() => {
    messagesApi.getAll()
      .then(r => {
        const msgs = r.data
        const partners = {}
        msgs.forEach(m => {
          const otherId = m.senderId === user.id ? m.receiverId : m.senderId
          if (!partners[otherId]) partners[otherId] = { userId: otherId, messages: [], lastMsg: m }
          partners[otherId].messages.push(m)
          if (new Date(m.createdAt) > new Date(partners[otherId].lastMsg.createdAt)) {
            partners[otherId].lastMsg = m
          }
        })
        setConversations(Object.values(partners))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    messagesApi.getConversation(selected.userId)
      .then(r => setMessages(r.data))
      .catch(console.error)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !selected) return
    setSending(true)
    try {
      if (socket?.connected) {
        socket.emit('sendMessage', { receiverId: selected.userId, content: text.trim() })
      } else {
        const res = await messagesApi.send({ receiverId: selected.userId, content: text.trim() })
        setMessages(p => [...p, res.data])
      }
      setText('')
    } catch {
      toast.error('Failed to send message')
    } finally { setSending(false) }
  }

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-4 overflow-hidden" style={{height:'calc(100vh - 64px)'}}>
        <div className="w-72 card flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-earth-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-700 text-lg text-earth-900">Messages</h2>
              <div className="flex items-center gap-1.5 text-xs">
                {connected
                  ? <><Wifi className="w-3.5 h-3.5 text-leaf-500" /><span className="text-leaf-500">Live</span></>
                  : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Offline</span></>
                }
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-300" />
              <input className="input pl-9 text-sm py-2" placeholder="Search..." />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No messages" description="Start a conversation from a listing" />
            ) : (
              conversations.map(c => (
                <button key={c.userId} onClick={() => setSelected(c)}
                  className={`w-full text-left p-4 border-b border-earth-50 hover:bg-earth-50 transition-colors ${selected?.userId === c.userId ? 'bg-leaf-50 border-l-2 border-l-leaf-500' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-leaf-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-leaf-700 font-semibold text-sm">U</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-earth-900 text-sm truncate">{c.userId.slice(0,8)}...</p>
                      <p className="text-earth-400 text-xs truncate">{c.lastMsg?.content}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 card flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the left to start chatting" />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-earth-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center">
                  <span className="text-leaf-700 font-semibold text-sm">U</span>
                </div>
                <div>
                  <p className="font-semibold text-earth-900 text-sm">User {selected.userId.slice(0, 8)}...</p>
                  <p className="text-earth-400 text-xs">{connected ? '🟢 Messages deliver instantly' : '🔴 Reconnecting...'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-earth-300 text-sm py-8">No messages yet. Say hello!</p>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      m.senderId === user.id
                        ? 'bg-leaf-600 text-white rounded-br-sm'
                        : 'bg-earth-100 text-earth-900 rounded-bl-sm'}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${m.senderId === user.id ? 'text-leaf-200' : 'text-earth-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-earth-100 flex gap-3">
                <input className="input flex-1" placeholder="Type a message..." value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)} />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4 flex items-center gap-2">
                  {sending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
