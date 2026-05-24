import { useEffect, useState } from 'react';
import '@/views/Home/Home.css';

export default function Home() {
  const slides = [
    `${import.meta.env.BASE_URL}images/slider1.jpg`,
    `${import.meta.env.BASE_URL}images/slider2.jpg`,
    `${import.meta.env.BASE_URL}images/slider3.jpg`,
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-900 antialiased">
      {/* HERO SLIDER */}
      <section className="relative w-full h-screen overflow-hidden bg-gray-900">
        {/* Slides */}
        <div className="absolute inset-0">
          {slides.map((src, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{
                backgroundImage: `url(${src})`,
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 1 : 0,
              }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        {/* Prev */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center"
        >
          ❮
        </button>

        {/* Next */}
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center"
        >
          ❯
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30 text-xs font-semibold uppercase">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Chào mừng đến với Giáo xứ
          </div>

          <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl">Giáo xứ Ngũ Phúc</h1>

          <p className="text-lg md:text-2xl italic text-white/90 drop-shadow">
            “Hiệp thông – Phục vụ – Loan báo Tin Mừng”
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold transition">
              Tin tức mới nhất
            </button>

            <button className="h-12 px-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/40 font-bold transition">
              Lịch lễ hôm nay
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="py-16"></main>
    </div>
  );
}
