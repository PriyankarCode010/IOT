"use client"
import { useEffect, useState, useRef } from "react"
import { Send } from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  // Fetch messages every 5 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [logRes, replyRes] = await Promise.all([
          fetch("/api/log"),
          fetch("/api/reply/all")
        ])
        const logs = await logRes.json()
        const replies = await replyRes.json()
        const herMessages = logs.map((log) => ({
          type: "received",
          message: log.message,
          timestamp: new Date(log.timestamp),
        }))
        const myMessages = replies.map((reply) => ({
          type: "sent",
          message: reply.message,
          timestamp: new Date(reply.timestamp),
        }))
        const merged = [...herMessages, ...myMessages]
        merged.sort((a, b) => a.timestamp - b.timestamp)
        setMessages(merged)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendReply = async () => {
    if (!input.trim()) return
    try {
      await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      })
      setInput("")
    } catch (err) {
      console.error("Send reply error:", err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendReply()
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100">
      <div className="w-full max-w-md h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-gray-100 bg-white/70 backdrop-blur-md overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/60">
          <span className="font-bold text-lg tracking-tight text-gray-800">Her</span>
          <span className="flex items-center gap-2 text-xs text-green-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Online
          </span>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-gradient-to-b from-white/60 to-pink-50/40">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20 text-base">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl shadow-md max-w-[75%] transition-all duration-300 opacity-90 ${
                    msg.type === "sent"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-400 text-white"
                      : "bg-gradient-to-r from-pink-400 to-rose-400 text-white"
                  }`}
                  style={{animation: 'fadeIn 0.4s'}}
                >
                  <div className="text-sm font-medium break-words">{msg.message}</div>
                  <div className={`text-[10px] mt-1 opacity-70 ${msg.type === "sent" ? "text-right" : "text-left"}`}>
                    {msg.timestamp && !isNaN(msg.timestamp.getTime())
                      ? msg.timestamp.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="px-4 py-3 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-700 placeholder-gray-400 shadow-sm"
            />
            <button
              onClick={sendReply}
              disabled={!input.trim()}
              className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}
