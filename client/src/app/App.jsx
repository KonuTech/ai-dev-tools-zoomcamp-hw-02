import { useState, useEffect } from 'react'
import { useSocket } from './useSocket'
import { useTheme } from './useTheme'
import { Room } from '../pages/Room'
import { ThemeToggle } from '../components/ThemeToggle'

// Generate a simple unique user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
}

function App() {
  // Get ALL socket functionality - only call useSocket ONCE in the entire app
  const socketData = useSocket()
  const { connected, joinRoom, roomState, users, sendCodeChange, changeLanguage, sendCursorPosition } = socketData

  // Theme management
  const { isDark, toggleTheme } = useTheme()

  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [userId, setUserId] = useState('')

  // Generate user ID on mount
  useEffect(() => {
    setUserId(generateUserId())
  }, [])

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId && username && userId) {
      joinRoom(roomId, userId, username)
      setJoined(true)
    }
  }

  const handleLeaveRoom = () => {
    setJoined(false)
    setRoomId('')
    // Generate new user ID for next session
    setUserId(generateUserId())
  }

  // If joined, show the Room component and pass ALL socket data
  if (joined) {
    return (
      <>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        <Room
          roomId={roomId}
          userId={userId}
          username={username}
          onLeave={handleLeaveRoom}
          // Pass socket data and methods
          connected={connected}
          roomState={roomState}
          users={users}
          sendCodeChange={sendCodeChange}
          changeLanguage={changeLanguage}
          sendCursorPosition={sendCursorPosition}
        />
      </>
    )
  }

  // Otherwise, show the join form
  return (
    <>
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      <div style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px'
          }}>
            Collaborative Coding Interview Platform
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)'
          }}>
            Status: {connected ?
              <span style={{ color: 'var(--status-online)' }}>🟢 Connected</span> :
              <span style={{ color: 'var(--status-offline)' }}>🔴 Disconnected</span>
            }
          </p>
        </div>

        <div style={{
          maxWidth: '500px',
          margin: '0 auto 50px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '30px',
          borderRadius: '12px',
          border: `2px solid var(--border-color)`,
          boxShadow: `0 8px 24px var(--shadow)`
        }}>
          <h2 style={{
            marginBottom: '25px',
            color: 'var(--text-primary)',
            fontSize: '1.5rem'
          }}>
            Join or Create a Room
          </h2>
          <form onSubmit={handleJoinRoom} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Your Name:
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                style={{
                  padding: '12px 16px',
                  width: '100%',
                  fontSize: '16px',
                  borderRadius: '8px'
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="roomId" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Room ID:
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter or create room ID"
                style={{
                  padding: '12px 16px',
                  width: '100%',
                  fontSize: '16px',
                  borderRadius: '8px'
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '14px 28px',
                fontSize: '18px',
                fontWeight: '600',
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Join Room
            </button>
          </form>
        </div>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '30px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: `2px solid var(--border-color)`,
          boxShadow: `0 8px 24px var(--shadow)`
        }}>
          <h3 style={{
            marginBottom: '20px',
            color: 'var(--text-primary)',
            fontSize: '1.3rem'
          }}>
            Development Status
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 1: Scaffold & Docker Setup</li>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 2: Real-time Collaboration</li>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 3: Code Editor Integration</li>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 4: Code Execution</li>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 5: Testing & Quality Assurance</li>
            <li style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>✅ Phase 6: Production & CI/CD</li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default App
