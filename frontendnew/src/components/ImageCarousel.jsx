import { useState } from 'react';

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="image-carousel">
        <div className="carousel-main-image">
          <img
            src="https://via.placeholder.com/500x500?text=No+Image"
            alt="No image available"
            className="carousel-image"
          />
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex] || images[0];

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="image-carousel">
      <div className="carousel-main-image">
        {images.length > 1 && (
          <button
            className="carousel-nav-btn carousel-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}
        <img
          src={currentImage.image_url || 'https://via.placeholder.com/500x500?text=No+Image'}
          alt={`Product image ${currentIndex + 1}`}
          className="carousel-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
          }}
        />
        {images.length > 1 && (
          <button
            className="carousel-nav-btn carousel-nav-next"
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                alt={`Thumbnail ${index + 1}`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
