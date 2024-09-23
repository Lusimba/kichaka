// src/components/ImageCarousel.jsx
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageCarousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    cssEase: 'linear',
    arrows: false,
  };

  const images = [
    '/images/art0.jpeg',
    '/images/art1.jpeg',
    '/images/art2.jpeg',
    '/images/art3.jpeg',
    '/images/art4.jpeg',
    '/images/art5.jpeg',
    '/images/art6.jpeg',
  ];

  return (
    <Slider {...settings} className="h-screen w-screen">
      {images.map((image, index) => (
        <div key={index} className="h-screen w-screen">
          <div
            className="w-full h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
      ))}
    </Slider>
  );
};

export default ImageCarousel;