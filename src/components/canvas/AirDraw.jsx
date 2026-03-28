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

  useEffect(() => {
    let camera = null;
    let hands = null;

    const initializeMediaPipe = async () => {
      try {
        hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results) => {
          if (!canvasRef.current || !webcamRef.current?.video) return;
          
          const videoWidth = webcamRef.current.video.videoWidth;
          const videoHeight = webcamRef.current.video.videoHeight;
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
          
          const ctx = canvasRef.current.getContext('2d');
          ctx.save();
          ctx.clearRect(0, 0, videoWidth, videoHeight);
          
          // Reverse the canvas context locally because webcam is mirrored
          ctx.translate(videoWidth, 0);
          ctx.scale(-1, 1);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw skeleton on PIP canvas
            ctx.fillStyle = "#a855f7"; // primary color
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            
            // Draw index point
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            
            ctx.beginPath();
            ctx.arc(indexTip.x * videoWidth, indexTip.y * videoHeight, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Calculate pinch distance
            const distance = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2)
            );
            
            // Pinch threshold
            const isPinching = distance < 0.05;

            // Invert X because camera is mirrored natively, so user's right naturally maps to screen right
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
                // Keep passing move events so we can show a cursor if we want, or do nothing.
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
          camera = new Camera(webcamRef.current.video, {
            onFrame: async () => {
              if (webcamRef.current?.video) {
                await hands.send({ image: webcamRef.current.video });
              }
            },
            width: 320,
            height: 240
          });
          camera.start().then(() => setIsReady(true));
        }
      } catch (err) {
        console.error("Hands initialization error", err);
      }
    };

    // Need a tiny timeout to ensure video element is rendered
    setTimeout(initializeMediaPipe, 1000);

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
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
