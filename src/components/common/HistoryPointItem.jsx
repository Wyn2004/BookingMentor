import React from 'react';
// import Button from './Button';

export const HistoryPointItem = ({ pointHistoryId, points, status, dateCreated, bookingId }) => {
  return (
    <div className="bg-white flex flex-col gap-5 rounded-md w-full">
      <div className="flex items-center justify-between p-4 rounded-md border-2 shadow-xl h-[130px] w-full">
        <div className="flex items-center space-x-3 w-full">
          {/* Hình ảnh */}
          <img src="/LeetCoin.png" alt="transaction icon" className="w-20 h-20 rounded-full" />

          {/* Thông tin */}
          <div className="flex flex-col pl-5 gap-2">
            <h1 className="font-bold text-xl text-blue-500">{status}</h1>
            <p>
              <span className="font-bold">Point history id:</span> {pointHistoryId}
            </p>
            <p>
              <span className="font-bold">Booking ID:</span> {bookingId}
            </p>
          </div>

          {/* Căn giữa dateCreated */}
          <div className="flex-1 flex justify-center items-center">
            <div className="text-center pr-5 text-base font-bold">{dateCreated}</div>
          </div>

          {/* Điểm */}
          <div className="text-right">
            <p className={`font-semibold ${points > 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {points > 0 ? `+${points}` : points} Points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HistoryPointItem;
