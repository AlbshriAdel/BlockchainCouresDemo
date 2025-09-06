'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Scan } from 'lucide-react';
import { dataService, ParticipantResponse } from '@/services/dataService';

interface QRScannerProps {
  onScanComplete?: (data: any) => void;
  onClose?: () => void;
}

interface ScanResult {
  type: 'success' | 'error' | 'processing';
  message: string;
  data?: any;
}

export function QRScanner({ onScanComplete, onClose }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      startScanningProcess();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanResult({
        type: 'error',
        message: 'Unable to access camera. Please check permissions or try uploading an image instead.'
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const startScanningProcess = () => {
    // Simulate QR code detection after 3 seconds
    setTimeout(() => {
      if (isScanning) {
        const mockQRData = {
          type: 'workshop-card',
          sessionId: 'demo-session-123',
          cardId: 'card-456',
          timestamp: Date.now(),
        };
        
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const qrString = `${baseUrl}/scan?data=${encodeURIComponent(JSON.stringify(mockQRData))}`;
        handleQRCodeDetected(qrString);
      }
    }, 3000);
  };

  const handleQRCodeDetected = (qrData: string) => {
    stopCamera();
    
    try {
      const parsedData = dataService.parseQRData(qrData);
      
      if (parsedData.type === 'workshop-card') {
        setScanResult({
          type: 'success',
          message: 'Workshop card detected! Processing participant input...',
          data: parsedData
        });
        
        setTimeout(() => {
          processParticipantResponse(parsedData);
        }, 1000);
      } else {
        setScanResult({
          type: 'success',
          message: 'QR code detected, but not a workshop card.',
          data: parsedData
        });
      }
      
      onScanComplete?.(parsedData);
    } catch (error) {
      setScanResult({
        type: 'error',
        message: 'Invalid QR code format.'
      });
    }
  };

  const processParticipantResponse = (qrData: any) => {
    const mockElementResponses = [
      {
        elementId: 'name-field',
        elementType: 'NAME_LABEL',
        originalValue: '',
        scannedValue: 'John Doe',
        processedValue: 'John Doe',
        confidence: 0.95
      },
      {
        elementId: 'feedback-area',
        elementType: 'TEXT_AREA',
        originalValue: '',
        scannedValue: 'Great workshop! Learned a lot about collaboration.',
        processedValue: 'Great workshop! Learned a lot about collaboration.',
        confidence: 0.87
      }
    ];

    const response: Omit<ParticipantResponse, 'id' | 'scannedAt'> = {
      participantId: 'participant-' + Date.now(),
      sessionId: qrData.sessionId,
      cardId: qrData.cardId,
      elementResponses: mockElementResponses,
      processedAt: new Date()
    };

    const savedResponse = dataService.addParticipantResponse(response);
    
    if (savedResponse) {
      setScanResult({
        type: 'success',
        message: `Participant response processed successfully!`,
        data: { ...savedResponse, elementResponses: mockElementResponses }
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanResult({ type: 'processing', message: 'Processing image...' });

    setTimeout(() => {
      const mockQRData = {
        type: 'workshop-card',
        sessionId: 'uploaded-session-789',
        cardId: 'uploaded-card-123',
        timestamp: Date.now(),
      };
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const qrString = `${baseUrl}/scan?data=${encodeURIComponent(JSON.stringify(mockQRData))}`;
      handleQRCodeDetected(qrString);
    }, 2000);
    
    event.target.value = '';
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setScanResult(null);
    onClose?.();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Scan className="w-4 h-4" />
        <span>Scan Cards</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">QR Code Scanner</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!isScanning && !scanResult && (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Scan Workshop Cards</h3>
                    <p className="text-gray-600">
                      Use your camera to scan QR codes on physical workshop cards, 
                      or upload an image containing a QR code.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={startCamera}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Use Camera</span>
                    </button>

                    <label className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span>Upload Image</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Position the QR code within the frame
                    </p>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Stop Scanning
                    </button>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <div className={`flex items-start space-x-3 p-4 rounded-lg ${
                    scanResult.type === 'success' ? 'bg-green-50 border border-green-200' :
                    scanResult.type === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    {scanResult.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                    {scanResult.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                    {scanResult.type === 'processing' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-0.5"></div>
                    )}
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        scanResult.type === 'success' ? 'text-green-800' :
                        scanResult.type === 'error' ? 'text-red-800' :
                        'text-blue-800'
                      }`}>
                        {scanResult.message}
                      </p>
                      
                      {scanResult.data && scanResult.type === 'success' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>Session:</strong> {scanResult.data.sessionId}</p>
                          <p><strong>Card:</strong> {scanResult.data.cardId}</p>
                          {scanResult.data.elementResponses && (
                            <div className="mt-2">
                              <p><strong>Detected Content:</strong></p>
                              <ul className="list-disc list-inside ml-2">
                                {scanResult.data.elementResponses.map((response: any, index: number) => (
                                  <li key={index}>
                                    {response.elementType}: "{response.scannedValue}" 
                                    <span className="text-green-600"> ({Math.round(response.confidence * 100)}% confidence)</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        setScanResult(null);
                        setIsScanning(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}