import React, { useEffect, useState } from 'react';
import { BookingItem } from './BookingItem';
import { Segmented } from 'antd';
import { useUserStore } from '../../store/useUserStore';
import {
  getAllActiveBooking,
  getAllBookingForGroupByStatus,
  getAllBookingForMentorByStatus
} from '../../apis/BookingServices';
import { toast } from 'react-toastify';
import { convertDateMeeting, formatDate } from '../../utils/commonFunction';

function BookingList() {
  const [filter, setFilter] = useState('PENDING');
  const [bookings, setBookings] = useState([]);
  const { fullData, role, userData } = useUserStore();

  const rejectByMentor = async id => {
    try {
      const response = await rejectBooking(id, token);
      console.log(response);
      if (response && response?.statusCode === 200) {
        Swal.fire({
          title: 'Reject Successful!',
          text: `Your booking has been reject successfully.`,
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
        setStatus('REJECTED');
      } else toast.error(response?.message);
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  useEffect(() => {
    const checkExpiredEvents = () => {
      const now = new Date();
      bookings.forEach(booking => {
        if (booking?.status === 'PENDING' && booking?.mentorSchedule?.availableFrom > now) {
          rejectByMentor(booking?.id);
        }
      });
    };

    const interval = setInterval(checkExpiredEvents, 1000); // Kiểm tra mỗi giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
  }, [bookings]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchAllActiveBooking = async () => {
      try {
        let response;
        role === 'MENTOR'
          ? (response = await getAllBookingForMentorByStatus(userData?.id, filter, token))
          : (response = await getAllBookingForGroupByStatus(fullData?.groupDTO?.id, filter, token));

        console.log(response);
        response && response?.statusCode === 200 ? setBookings(response?.bookingDTOList) : setBookings([]);
      } catch (error) {
        toast.error(error.message);
        console.log(error.message);
      }
    };
    fetchAllActiveBooking();
  }, [userData?.id, filter, fullData?.groupDTO?.id]);

  return (
    <div>
      <Segmented
        options={['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED']}
        value={filter}
        onChange={setFilter}
        className="mb-5"
      />
      <div>
        <div className="flex flex-col gap-3 p-3 bg-white rounded-md">
          {bookings?.length === 0 ? (
            <p className="text-red-500">Do not have any {filter} booking.</p>
          ) : (
            bookings?.map(booking => (
              <BookingItem
                //
                key={booking?.id}
                idBooking={booking?.id}
                className={booking?.group?.classDTO?.className}
                idGroup={booking?.group?.id}
                status={booking?.status}
                group={booking?.group?.groupName}
                point={booking?.pointPay}
                schedule={convertDateMeeting(booking?.mentorSchedule)}
                dateCreated={formatDate(booking?.dateCreated)}
                members={booking?.group?.students}
                project={booking?.group?.project?.projectName}
                studentBook={booking?.group?.students?.find(student => student?.groupRole === 'LEADER')?.user?.fullName}
                studentBookId={booking?.group?.students?.find(student => student?.groupRole === 'LEADER')?.user?.id}
                mentor={booking?.mentor?.user?.fullName}
                mentorUserId={booking?.mentor?.user?.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingList;
