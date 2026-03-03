import React, { useState, useEffect, useRef } from 'react';
import './TelehealthVideoChat.css';

interface TelehealthVideoChatProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  doctorName: string;
  patientName?: string;
  userRole: 'doctor' | 'patient';
}

export default function TelehealthVideoChat({
  isOpen,
  onClose,
  appointmentId,
  doctorName,
  patientName,
  userRole
}: TelehealthVideoChatProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      startVideoChat();
    } else {
      stopVideoChat();
    }

    return () => {
      stopVideoChat();
    };
  }, [isOpen]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const startVideoChat = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');

      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      
      // Simulate remote stream (in real app, this would come from WebRTC peer connection)
      // For demo purposes, we'll create a placeholder
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnecting(false);
        // In a real implementation, you would set up WebRTC here
        // For now, we'll just show the local stream
      }, 1500);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
      setIsConnecting(false);
      setConnectionStatus('disconnected');
    }
  };

  const stopVideoChat = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    setConnectionStatus('disconnected');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleEndCall = () => {
    stopVideoChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="telehealth-overlay">
      <div className="telehealth-container">
        <div className="telehealth-header">
          <div className="telehealth-header-info">
            <h3>Telehealth Consultation</h3>
            <p>
              {userRole === 'doctor' ? `Patient: ${patientName || 'Patient'}` : `Doctor: ${doctorName}`}
            </p>
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}></span>
              <span className="status-text">
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={handleEndCall}>
            ×
          </button>
        </div>

        <div className="telehealth-video-container">
          {/* Remote Video (Doctor/Patient) */}
          <div className="remote-video-wrapper">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            {!remoteStream && (
              <div className="video-placeholder">
                <div className="placeholder-avatar">
                  {userRole === 'doctor' ? '👤' : '👨‍⚕️'}
                </div>
                <p>{userRole === 'doctor' ? patientName || 'Patient' : doctorName}</p>
                {isConnecting && <p className="connecting-text">Connecting...</p>}
              </div>
            )}
          </div>

          {/* Local Video (Self) */}
          <div className="local-video-wrapper">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
            {!localStream && (
              <div className="video-placeholder small">
                <div className="placeholder-avatar">You</div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="telehealth-controls">
          <button
            className={`control-btn ${isAudioEnabled ? 'active' : 'muted'}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>
          <button
            className={`control-btn ${isVideoEnabled ? 'active' : 'muted'}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? '📹' : '📷'}
          </button>
          <button
            className="control-btn end-call"
            onClick={handleEndCall}
            title="End call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}

