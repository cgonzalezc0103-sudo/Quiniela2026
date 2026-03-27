import React, { useState } from 'react';

interface FlagImageProps {
  siglas: string;
  nombre: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const FlagImage: React.FC<FlagImageProps> = ({ 
  siglas, 
  nombre, 
  className = '', 
  size = 'medium' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = () => {
    // Convertir siglas a minúsculas
    const siglasLower = siglas.toLowerCase();
    return `https://quiniela-images.s3.us-east-1.amazonaws.com/images/equipos/${siglasLower}.png`;
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'flag-small';
      case 'large': return 'flag-large';
      default: return 'flag-medium';
    }
  };
  
  const getPlaceholder = () => {
    // Mostrar las siglas si no se carga la imagen
    return siglas.toUpperCase();
  };
  
  return (
    <div className={`flag-container ${getSizeClass()} ${className}`}>
      {!imageError ? (
        <img
          src={getImageUrl()}
          alt={`Bandera de ${nombre}`}
          className="flag-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flag-placeholder">
          {getPlaceholder()}
        </div>
      )}
    </div>
  );
};

export default FlagImage;