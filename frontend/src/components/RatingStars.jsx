import { useState } from 'react'
import { Star } from 'lucide-react'

const RatingStars = ({ 
  rating = 0, 
  onRatingChange, 
  interactive = false, 
  size = 'md' 
}) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating)
        const isInteractive = interactive && onRatingChange
        
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={!isInteractive}
            className={`
              ${sizeClasses[size]}
              ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform duration-150
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${isFilled 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
                }
                transition-colors duration-150
              `}
            />
          </button>
        )
      })}
    </div>
  )
}

export default RatingStars
