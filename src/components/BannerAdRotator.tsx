'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Ad {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export default function BannerAdRotator() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchActiveAds = async () => {
    try {
      const response = await fetch('/api/ads/rotation');
      const data = await response.json();
      setAds(data.ads || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      setLoading(false);
    }
  };

  const handleAdClick = async (adId: number) => {
    try {
      await fetch('/api/ads/rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId }),
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  if (loading || ads.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Advertisement Space Available</p>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className="w-full h-32 relative overflow-hidden rounded-lg bg-gray-100">
      <Link
        href={currentAd.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleAdClick(currentAd.id)}
        className="block w-full h-full"
      >
        <Image
          src={currentAd.imageUrl}
          alt={currentAd.title}
          fill
          className="object-cover"
          priority
        />
      </Link>
      
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}