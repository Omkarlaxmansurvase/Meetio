import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ExpandIcon from '@mui/icons-material/Fullscreen';
import MinimizeIcon from '@mui/icons-material/FullscreenExit';
import PeopleIcon from '@mui/icons-material/People';
import server from '../environment';

const server_url = server;
var connections = {};
const peerConfigConnections = {
  "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
}

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([])
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([])
  let [videos, setVideos] = useState([])
  const chatBottomRef = useRef(null);
  let [fullscreenVideo, setFullscreenVideo] = useState(null);
  let [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => { getPermissions(); }, [])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess).then(() => {}).catch((e) => console.log(e))
      }
    }
  }

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) { setVideoAvailable(true); } else { setVideoAvailable(false); }
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) { setAudioAvailable(true); } else { setAudioAvailable(false); }
      if (navigator.mediaDevices.getDisplayMedia) { setScreenAvailable(true); } else { setScreenAvailable(false); }
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) { localVideoref.current.srcObject = userMediaStream; }
        }
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) { getUserMedia(); }
  }, [video, audio])

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  let getUserMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { console.log(e) }
    window.localStream = stream
    localVideoref.current.srcObject = stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue
      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => { socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })) })
          .catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false); setAudio(false);
      try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) { }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoref.current.srcObject = window.localStream
      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => { socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })) })
            .catch(e => console.log(e))
        })
      }
    })
  }

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess).then(() => {}).catch((e) => console.log(e))
    } else {
      try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) { }
    }
  }

  let getDislayMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { console.log(e) }
    window.localStream = stream
    localVideoref.current.srcObject = stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue
      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => { socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })) })
          .catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);

      try { localVideoref.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) { console.log(e) }

      navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
        .then((cameraStream) => {
          window.localStream = cameraStream;
          localVideoref.current.srcObject = cameraStream;

          for (let id in connections) {
            if (id === socketIdRef.current) continue;
            const senders = connections[id].getSenders();
            cameraStream.getTracks().forEach(newTrack => {
              const sender = senders.find(s => s.track && s.track.kind === newTrack.kind);
              if (sender) {
                sender.replaceTrack(newTrack).catch(e => console.log(e));
              } else {
                connections[id].addTrack(newTrack, cameraStream);
              }
            });
            connections[id].createOffer().then(description => {
              connections[id].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        })
        .catch(() => {
          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;
        });
    })
  }

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (!connections[fromId]) {
        console.warn(`No connection found for ${fromId}, ignoring signal.`);
        return;
      }
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
              }).catch(e => console.log(e))
            }).catch(e => console.log(e))
          }
        }).catch(e => console.log(e))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
      }
    }
  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })
    socketRef.current.on('signal', gotMessageFromServer)
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href)
      socketIdRef.current = socketRef.current.id
      socketRef.current.on('chat-message', addMessage)
      socketRef.current.on('user-left', (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })
      socketRef.current.on('user-joined', (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((videoObj) =>
                  videoObj.socketId === socketListId ? { ...videoObj, stream: event.stream } : videoObj
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = { socketId: socketListId, stream: event.stream, autoplay: true, playsinline: true };
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream)
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connections[socketListId].addStream(window.localStream)
          }
        })
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue
            try { connections[id2].addStream(window.localStream) } catch (e) { }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
              }).catch(e => console.log(e))
            })
          }
        }
      })
    })
  }

  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  let handleVideo = () => { setVideo(!video); }
  let handleAudio = () => { setAudio(!audio) }

  useEffect(() => {
    if (screen === true) { getDislayMedia(); }
    if (screen === false) {
      try {
        if (localVideoref.current && localVideoref.current.srcObject) {
          localVideoref.current.srcObject.getTracks().forEach(t => t.stop());
          localVideoref.current.srcObject.getTracks().forEach(t => { if (t.onended) t.onended(); });
        }
      } catch (e) { console.log(e); }
    }
  }, [screen])
  let handleScreen = () => { setScreen(prev => !prev); }

  let handleEndCall = () => {
    try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) { }
    window.location.href = "/"
  }

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender: sender, data: data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  let sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit('chat-message', message, username)
    setMessage("");
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const participantCount = videos.length + 1; // +1 for self

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyContainer}>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{
              fontFamily: "'Clash Display', sans-serif",
              fontSize: '1.8rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #FF9839, #D97500)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>Meetio</div>
          </div>

          <div className={styles.lobbyCard}>
            <h2>Join Meeting</h2>
            <p>Enter your name and preview your camera</p>

            <div className={styles.lobbyPreview}>
              <video ref={localVideoref} autoPlay muted style={{ width: '100%', borderRadius: '14px' }} />
            </div>

            <TextField
              fullWidth
              label="Your display name"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && connect()}
              sx={{
                marginBottom: '16px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(217,117,0,0.25)' },
                  '&:hover fieldset': { borderColor: '#D97500' },
                  '&.Mui-focused fieldset': { borderColor: '#D97500' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,200,120,0.6)', fontFamily: "'DM Sans', sans-serif" },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF9839' },
              }}
            />

            <button
              onClick={connect}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #D97500, #FF9839)',
                color: 'white', border: 'none',
                padding: '0.85rem', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Syne', sans-serif",
                boxShadow: '0 6px 24px rgba(217,117,0,0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 32px rgba(217,117,0,0.5)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(217,117,0,0.4)'; }}
            >
              Join Now →
            </button>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@700&family=Syne:wght@600&family=DM+Sans:wght@400;500&display=swap');
          `}</style>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {/* FULLSCREEN VIDEO VIEW */}
          {fullscreenVideo && (
            <div className={styles.fullscreenOverlay}>
              <div className={styles.fullscreenContent}>
                <video
                  ref={ref => {
                    if (ref && fullscreenVideo.stream) {
                      ref.srcObject = fullscreenVideo.stream;
                    }
                  }}
                  autoPlay
                  className={styles.fullscreenVideo}
                />
                <Tooltip title="Exit Fullscreen">
                  <IconButton
                    onClick={() => setFullscreenVideo(null)}
                    className={styles.exitFullscreenBtn}
                    sx={{
                      position: 'absolute', top: '20px', right: '20px',
                      background: 'rgba(0,0,0,0.5)', color: 'white',
                      '&:hover': { background: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <MinimizeIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}

          {/* CHAT ROOM */}
          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <h3>Chat</h3>
                  <IconButton onClick={() => setModal(false)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' }, padding: '4px' }}>
                    <CloseIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </div>

                <div className={styles.chattingDisplay}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,200,120,0.3)', fontSize: '0.85rem', paddingTop: '2rem' }}>
                      No messages yet. Say hi! 👋
                    </div>
                  ) : messages.map((item, index) => (
                    <div key={index} className={styles.chatMessage}>
                      <div className={styles.sender}>{item.sender}</div>
                      <div className={styles.msgText}>{item.data}</div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Type a message..."
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontFamily: "'DM Sans', sans-serif",
                        color: 'white', fontSize: '0.9rem',
                        background: 'rgba(255,255,255,0.05)',
                        '& fieldset': { borderColor: 'rgba(217,117,0,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(217,117,0,0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#D97500' },
                      },
                      '& input::placeholder': { color: 'rgba(255,200,120,0.3)' },
                    }}
                  />
                  <Tooltip title="Send message">
                    <IconButton
                      onClick={sendMessage}
                      sx={{
                        color: message.trim() ? '#FF9839' : 'rgba(255,255,255,0.2)',
                        background: message.trim() ? 'rgba(217,117,0,0.15)' : 'transparent',
                        borderRadius: '10px',
                        transition: 'all 0.2s',
                        '&:hover': { background: 'rgba(217,117,0,0.25)', color: '#FF9839' }
                      }}
                    >
                      <SendIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {/* PARTICIPANTS PANEL */}
          {showParticipants && (
            <div className={styles.participantsPanel}>
              <div className={styles.participantsHeader}>
                <h3>Participants ({participantCount})</h3>
                <IconButton onClick={() => setShowParticipants(false)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' }, padding: '4px' }}>
                  <CloseIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </div>

              <div className={styles.participantsList}>
                <div className={styles.participantItem}>
                  <div className={styles.participantAvatar}>You</div>
                  <div className={styles.participantName}>{username}</div>
                </div>
                {videos.map((video) => (
                  <div key={video.socketId} className={styles.participantItem}>
                    <div className={styles.participantAvatar}>{video.socketId.substring(0, 2).toUpperCase()}</div>
                    <div className={styles.participantName}>Participant</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENHANCED GRID VIEW */}
          <div className={styles.gridContainer} style={{ paddingRight: showModal ? '340px' : showParticipants ? '300px' : '20px' }}>
            <div className={`${styles.videoGrid} ${styles[`grid-${Math.min(videos.length + 1, 4)}`]}`}>
              {/* Local video in grid */}
              <div className={styles.videoGridItem} onDoubleClick={() => setFullscreenVideo({ stream: localVideoref.current?.srcObject })}>
                <video 
                  className={styles.gridVideo}
                  ref={localVideoref} 
                  autoPlay 
                  muted 
                />
                <div className={styles.videoLabel}>
                  <span className={styles.videoName}>{username}</span>
                  <span className={styles.audioIndicator} style={{ background: audio ? '#4CAF50' : '#ff5252' }} />
                </div>
                <Tooltip title="Fullscreen">
                  <IconButton className={styles.gridVideoControl} sx={{ fontSize: '0.8rem' }}>
                    <ExpandIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </div>

              {/* Remote videos in grid */}
              {videos.map((video) => (
                <div 
                  key={video.socketId} 
                  className={styles.videoGridItem}
                  onDoubleClick={() => setFullscreenVideo(video)}
                >
                  <video
                    className={styles.gridVideo}
                    data-socket={video.socketId}
                    ref={ref => { if (ref && video.stream) { ref.srcObject = video.stream; } }}
                    autoPlay
                  />
                  <div className={styles.videoLabel}>
                    <span className={styles.videoName}>Participant</span>
                  </div>
                  <Tooltip title="Fullscreen">
                    <IconButton 
                      className={styles.gridVideoControl}
                      onClick={() => setFullscreenVideo(video)}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      <ExpandIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL BAR */}
          <div className={styles.buttonContainers}>
            <Tooltip title={audio ? "Mute" : "Unmute"}>
              <div
                className={`${styles.controlBtn} ${audio ? styles.active : ''}`}
                onClick={handleAudio}
              >
                {audio ? <MicIcon sx={{ fontSize: '1.3rem' }} /> : <MicOffIcon sx={{ fontSize: '1.3rem', color: '#ff6b6b' }} />}
              </div>
            </Tooltip>

            <Tooltip title="End Call">
              <div className={`${styles.controlBtn} ${styles.endCall}`} onClick={handleEndCall}>
                <CallEndIcon sx={{ fontSize: '1.4rem', color: 'white' }} />
              </div>
            </Tooltip>

            <Tooltip title={video ? "Turn off camera" : "Turn on camera"}>
              <div
                className={`${styles.controlBtn} ${video ? styles.active : ''}`}
                onClick={handleVideo}
              >
                {video ? <VideocamIcon sx={{ fontSize: '1.3rem' }} /> : <VideocamOffIcon sx={{ fontSize: '1.3rem', color: '#ff6b6b' }} />}
              </div>
            </Tooltip>

            {screenAvailable && (
              <Tooltip title={screen ? "Stop sharing" : "Share screen"}>
                <div
                  className={`${styles.controlBtn} ${screen ? styles.active : ''}`}
                  onClick={handleScreen}
                >
                  {screen ? <ScreenShareIcon sx={{ fontSize: '1.3rem' }} /> : <StopScreenShareIcon sx={{ fontSize: '1.3rem' }} />}
                </div>
              </Tooltip>
            )}

            <Tooltip title="Participants">
              <div
                className={`${styles.controlBtn} ${showParticipants ? styles.active : ''}`}
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Badge
                  badgeContent={participantCount}
                  max={99}
                  sx={{ '& .MuiBadge-badge': { background: '#D97500', color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem' } }}
                >
                  <PeopleIcon sx={{ fontSize: '1.3rem' }} />
                </Badge>
              </div>
            </Tooltip>

            <Tooltip title="Chat">
              <Badge
                badgeContent={newMessages}
                max={99}
                sx={{ '& .MuiBadge-badge': { background: '#D97500', color: 'white', fontFamily: "'DM Sans', sans-serif" } }}
              >
                <div
                  className={`${styles.controlBtn} ${showModal ? styles.active : ''}`}
                  onClick={() => { setModal(!showModal); setNewMessages(0); }}
                >
                  <ChatIcon sx={{ fontSize: '1.3rem' }} />
                </div>
              </Badge>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}