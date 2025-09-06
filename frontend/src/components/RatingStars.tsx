import { useState } from 'react';
import { Rate } from 'antd';

interface RatingStarsProps {
  rating?: number;
  onRatingChange?: (value: number) => void;
  interactive?: boolean;
  size?: 'small' | 'default' | number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating = 0, 
  onRatingChange, 
  interactive = false, 
  size = 'default'
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleChange = (value: number) => {
    console.log('RatingStars handleChange:', value, 'interactive:', interactive);
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleHoverChange = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleHoverLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <Rate
      value={hoverRating || (rating > 0 ? rating : undefined)}
      onChange={handleChange}
      onHoverChange={handleHoverChange}
      onHoverLeave={handleHoverLeave}
      disabled={!interactive}
      size={size}
      style={{ 
        color: '#faad14',
        fontSize: size === 'small' ? '14px' : size === 'default' ? '16px' : `${size}px`
      }}
    />
  );
};

export default RatingStars
