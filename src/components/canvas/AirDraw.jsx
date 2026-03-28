import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Hands, VERSION } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { useCanvasStore } from '../../store/useCanvasStore';
import { X, Hand } from 'lucide-react';

const AirDraw = ({ onClose }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { setAirDrawEvent } = useCanvasStore();
  
  const [isReady, setIsReady] = useState(false);
  const isDrawingRef = useRef(false);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);

  const initializeMediaPipe = async () => {
    if (!webcamRef.current?.video || cameraRef.current) return;
    
    try {
      handsRef.current = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`;
        }
      });

      handsRef.current.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      handsRef.current.onResults((results) => {
        if (!canvasRef.current || !webcamRef.current?.video) return;
        
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          
          ctx.fillStyle = "#a855f7"; 
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          
          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];
          
          ctx.beginPath();
          ctx.arc(indexTip.x * videoWidth, indexTip.y * videoHeight, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          const distance = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2)
          );
          
          const isPinching = distance < 0.05;

          const mappedX = 1 - indexTip.x; 
          const mappedY = indexTip.y;

          if (isPinching) {
            if (!isDrawingRef.current) {
              isDrawingRef.current = true;
              setAirDrawEvent({ x: mappedX, y: mappedY, type: 'down' });
            } else {
              setAirDrawEvent({ x: mappedX, y: mappedY, type: 'move' });
            }
          } else {
            if (isDrawingRef.current) {
              isDrawingRef.current = false;
              setAirDrawEvent({ x: mappedX, y: mappedY, type: 'up' });
            } else {
              setAirDrawEvent({ x: mappedX, y: mappedY, type: 'hover' });
            }
          }
        } else {
          if (isDrawingRef.current) {
            isDrawingRef.current = false;
            setAirDrawEvent({ x: 0, y: 0, type: 'up' });
          }
        }
        ctx.restore();
      });

      if (webcamRef.current?.video) {
        cameraRef.current = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current?.video && handsRef.current) {
              await handsRef.current.send({ image: webcamRef.current.video });
            }
          },
          width: 320,
          height: 240
        });
        cameraRef.current.start().then(() => setIsReady(true));
      }
    } catch (err) {
      console.error("Hands initialization error", err);
    }
  };
    
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
      setAirDrawEvent(null);
    };
  }, [setAirDrawEvent]);

  return (
    <div className="absolute right-6 bottom-32 z-50 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Hand size={16} /> Air Draw <span className="text-[10px] text-slate-400 font-normal ml-1">(Pinch to draw)</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
          <X size={16} />
        </button>
      </div>
      <div className="relative w-48 h-36 rounded-lg overflow-hidden bg-slate-100">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Loading Camera...
          </div>
        )}
        <Webcam 
          ref={webcamRef}
          className="w-full h-full object-cover transform -scale-x-100"
          mirrored={true}
          audio={false}
          videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
          onUserMedia={initializeMediaPipe}
          onUserMediaError={(err) => console.error("Webcam Error:", err)}
        />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
};

export default AirDraw;
