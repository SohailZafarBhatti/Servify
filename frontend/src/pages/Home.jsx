import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useResponsive from '../hooks/useResponsive';

//  React compatible icon library hai Lucide icons
import { ShieldCheck, MessageSquare, Star, MapPin } from "lucide-react";

// Import images from assets
import cleaningImg from '../assets/cleaning.jpg';
import plumbingImg from '../assets/plumbing.jpg';
import electricalImg from '../assets/electrical.jpg';
import gardeningImg from '../assets/gardening.jpg';
import paintingImg from '../assets/painting.jpg';
import carpentryImg from '../assets/carpentry.jpg';
import professionalImg from '../assets/professional.jpg';
import expertsImg from '../assets/experts.jpg';
import servicesImg from '../assets/services.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: professionalImg,
      title: 'Hire Verified Professionals',
      subtitle: 'for Home & Business Services',
    },
    {
      image: expertsImg,
      title: 'Connect With Trusted Experts',
      subtitle: 'Plumbing, Cleaning, Electrical & More',
    },
    {
      image: servicesImg,
      title: 'All Services at Your Fingertips',
      subtitle: 'Post tasks, hire professionals instantly',
    }
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary-600" />,
      title: 'Find Trusted Providers',
      description: 'Browse verified service providers in your area with detailed profiles and reviews.'
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-primary-600" />,
      title: 'Real-time Communication',
      description: 'Chat directly with service providers to discuss requirements and get quotes.'
    },
    {
      icon: <Star className="w-10 h-10 text-primary-600" />,
      title: 'Verified Reviews',
      description: 'Read authentic reviews from real customers to make informed decisions.'
    },
    {
      icon: <MapPin className="w-10 h-10 text-primary-600" />,
      title: 'Location-based Matching',
      description: 'Find providers near you with our smart location-based search system.'
    }
  ];

  const categories = [
    { name: 'Cleaning', icon: '🧹', image: cleaningImg },
    { name: 'Plumbing', icon: '🔧', image: plumbingImg },
    { name: 'Electrical', icon: '⚡', image: electricalImg },
    { name: 'Gardening', icon: '🌱',  image: gardeningImg },
    { name: 'Painting', icon: '🎨',  image: paintingImg },
    { name: 'Carpentry', icon: '🔨',  image: carpentryImg }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden rounded-xl">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[8000ms] ${
                index === currentSlide ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-4 md:px-8">
              <h1
                className={`${
                  isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
                } font-bold text-white transition-all duration-700 transform ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-10 opacity-0'
                }`}
                style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.6)' }}
              >
                {slide.title}
              </h1>
              <p
                className={`text-yellow-300 text-lg md:text-xl mt-2 transition-all duration-700 transform ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-10 opacity-0'
                }`}
                style={{ textShadow: '1px 1px 8px rgba(0,0,0,0.6)' }}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Slide Dots Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="section-container px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Why Choose SERVIFY
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mb-12">
            SERVIFY connects you with verified service providers for reliable, convenient, and seamless home and business solutions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-12 md:py-20">
        <div className="section-container px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Popular Service Categories
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Find the right professional for any job
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition-all transform hover:-translate-y-2"
                onClick={() => navigate(`/tasks?category=${category.name}`)}
              >
                <div className={`${isMobile ? "h-40" : "h-48"} overflow-hidden relative`}>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      <span>{category.icon}</span> {category.name}
                    </h3>
                    
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">SERVIFY</h2>
              <p className="text-sm">
                Connecting you with trusted service providers for all your daily needs.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/services" className="hover:text-white">Services</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
                <li><Link to="/help-center" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Get in Touch</h3>
              <p className="text-sm">📍 Gujranwala, Pakistan</p>
              <p className="text-sm">📞 +92 303-5065560</p>
              <p className="text-sm">✉️ zsohial6@gmail.com</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SERVIFY. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
