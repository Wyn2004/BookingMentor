import React, { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';
import { useUserStore } from '../../store/useUserStore';
import { getAllNotiByReceiverId } from '../../apis/NotificationServices';
import { formatDate } from '../../utils/commonFunction';

const ListNotification = () => {
  const [notis, setNotis] = useState([]);
  const { userData } = useUserStore();
  useEffect(() => {
    fetchAllNotiByReceiverId();
  }, [userData]);
  const fetchAllNotiByReceiverId = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await getAllNotiByReceiverId(userData?.user?.id, token);
      console.log(response);
      response?.statusCode === 200 ? setNotis(response?.notificationsDTOList) : setNotis([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col break-words gap-3">
      <div className=" bg-white flex flex-col gap-5 p-3 rounded-md">
        {notis?.length === 0 ? (
          <p className="text-red-500">Do not have any notification booking.</p>
        ) : (
          notis?.map(noti => (
            <NotificationItem
              key={noti?.id}
              notiId={noti?.id}
              type={noti.type}
              senderName={noti?.sender?.fullName}
              content={noti?.message}
              daySent={formatDate(noti?.dateTimeSent)}
              senderId={noti?.sender?.id}
              groupName={noti?.groupDTO?.groupName}
              groupId={noti?.groupDTO?.id}
              studentSenderId={noti?.sender?.student?.id}
              updateActionClick={fetchAllNotiByReceiverId}
              notiAction={noti?.action}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ListNotification;
