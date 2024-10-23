import React from 'react';
import HistoryPointItem from './HistoryPointItem';

export const ListHistoryPoint = ({ pointHistoryId, points, status, dateCreated, bookingId }) => {
  return (
    <div className='flex flex-col gap-3'>
      {/* div chứa points */}
      <div className="flex justify-start pr-40">
        <div className="inline-flex px-3 py-1 font-medium text-white bg-main-1 rounded-lg">
          {/* fix */}
          <span>Total Point: 100</span>
        </div>
      </div>

      {/* Tạo các HistoryPointItem trực tiếp */}
      <div className="p-3 bg-white rounded-md flex flex-col gap-5">
        <HistoryPointItem
          dateCreated={'Tuesday, Oct 1, 2024'}
          pointHistoryId={111}
          status={'Purchased'}
          points={-10}
          bookingId={121}
        />
        <HistoryPointItem
          dateCreated={'Thurday, Sep 18, 2024'}
          pointHistoryId={112}
          status={'Earned'}
          points={50}
          bookingId={122}
        />
        <HistoryPointItem
          dateCreated={'Saturday, Feb 6, 2024'}
          pointHistoryId={113}
          status={'Bonus'}
          points={20}
          bookingId={123}
        />
        <HistoryPointItem
          dateCreated={'Saturday, Feb 6, 2024'}
          pointHistoryId={113}
          status={'Bonus'}
          points={-20}
          bookingId={123}
        />        
      </div>
    </div>
  );
};
export default ListHistoryPoint;
