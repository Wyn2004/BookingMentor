import React, { useState } from 'react';
import Rating from '@mui/material/Rating';
import { Stack } from '@mui/material';

const Feedback = () => {
  const [rating, setRating] = useState(2.5);
  const [comment, setComment] = useState('');

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = e => {
    setComment(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log({ rating, comment });
    // Xử lý logic khi form được gửi đi ở đây nhen
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md " onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center mb-4">How are you feeling about (mentorname) ?</h2>
        <p className="text-center mb-4 text-gray-400 text-sm">
          Your input is valuable in helping us better understand your needs and tailor our service accordingly.
        </p>
        <Stack spacing={2} className="mb-6">
          <div className="flex justify-center mb-6">
            <Rating
              name="feedback-rating"
              value={rating}
              precision={0.5}
              onChange={handleRatingChange}
              size="large" 
            />
          </div>
        </Stack>
        <div className="mb-6">
          <textarea
            className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="6"
            placeholder="Add a Comment..."
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-700 transition-all"
        >
          Submit Now
        </button>
      </form>
    </div>
  );
};

export default Feedback;
