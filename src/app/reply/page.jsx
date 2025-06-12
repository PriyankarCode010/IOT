"use client"
import { useEffect, useState } from "react"
import { Heart, Send } from "lucide-react"

export default function RomanticChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  // Fetch messages every 5 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/log")
        const logs = await res.json()
        const replyRes = await fetch("/api/reply")
        const replyData = await replyRes.json()

        const formatted = logs.map((log) => ({
          type: "received", // Messages from her
          message: log.message,
          timestamp: new Date(log.timestamp),
        }))

        if (replyData.message && replyData.message !== "No message yet") {
          formatted.push({
            type: "sent", // Messages from me
            message: replyData.message,
            timestamp: new Date(),
          })
        }

        // Sort all messages chronologically
        formatted.sort((a, b) => a.timestamp - b.timestamp)
        setMessages(formatted)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-6 text-center relative">
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
              <h2 className="text-2xl font-bold text-white">Our Chat</h2>
              <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
            <p className="text-pink-100 text-sm">Where we connect 💕</p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/50 to-pink-50/30">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-300" />
              <p className="text-lg">Start your conversation...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg relative ${
                    msg.type === "sent"
                      ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-br-md"
                      : "bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-bl-md"
                  }`}
                >
                  {/* Message bubble tail */}
                  <div
                    className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                      msg.type === "sent" ? "bg-blue-500 -right-1" : "bg-pink-400 -left-1"
                    }`}
                  ></div>

                  <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                  <span className="block text-xs opacity-75 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/70 backdrop-blur-sm border-t border-pink-200/50">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your loving message..."
                className="w-full px-4 py-3 pr-12 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/80 placeholder-pink-300 text-gray-700 transition-all duration-200"
              />
              <Heart className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-300" />
            </div>
            <button
              onClick={sendReply}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating hearts decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Heart
            className="absolute top-20 left-8 w-4 h-4 text-pink-200 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <Heart
            className="absolute top-32 right-12 w-3 h-3 text-rose-200 animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <Heart
            className="absolute bottom-32 left-16 w-5 h-5 text-pink-200 animate-bounce"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>
    </div>
  )
}
