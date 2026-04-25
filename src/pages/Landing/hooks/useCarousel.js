import { useState, useEffect } from 'react';

export function useCarousel(itemCount, intervalMs = 3000) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % itemCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [itemCount, intervalMs]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % itemCount);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + itemCount) % itemCount);
  const goToSlide = (index) => setCurrentSlide(index);

  return { currentSlide, nextSlide, prevSlide, goToSlide };
}
