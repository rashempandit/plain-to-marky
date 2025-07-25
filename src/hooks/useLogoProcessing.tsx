import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

export const useLogoProcessing = () => {
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processOriginalLogo = async () => {
      setIsProcessing(true);
      try {
        // Fetch the original uploaded logo
        const response = await fetch('https://lovable-uploads.s3.amazonaws.com/92c68078-1244-4e00-8c95-5b4d93742c71.png');
        const blob = await response.blob();
        
        // Load the image
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedLogoUrl(url);
      } catch (error) {
        console.error('Failed to process logo:', error);
        // Fallback to original logo if processing fails
        setProcessedLogoUrl('https://lovable-uploads.s3.amazonaws.com/92c68078-1244-4e00-8c95-5b4d93742c71.png');
      } finally {
        setIsProcessing(false);
      }
    };

    processOriginalLogo();
  }, []);

  return { processedLogoUrl, isProcessing };
};