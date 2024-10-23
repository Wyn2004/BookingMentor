import React, { useEffect } from 'react';
import { Navigation } from '../../components';
import { menuNavbarItemsMentor } from '../../utils/constant';
import { Outlet } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { getMyProfile } from '../../apis/UserServices';
import { getClassByIdMentor } from '../../apis/MentorServices';

const PublicMentor = () => {
  const { setUserData, setCurrent } = useUserStore();
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getMyProfile(token);
        const mentorsDTO = {
          ...response.mentorsDTO,
          aclass: response?.mentorsDTO?.assignedClass
        };
        console.log(mentorsDTO);
        setUserData(mentorsDTO);
        const name = mentorsDTO?.user?.fullName.split(' ');
        setCurrent(name.length > 0 ? name[name.length - 1] : mentorsDTO.user.fullName);
      } catch (err) {
      } finally {
      }
    };

    fetchUserData();
  }, []);
  return (
    <div className="w-full flex-wrap flex justify-end">
      <Navigation menuNavbar={menuNavbarItemsMentor}>
        <Outlet />
      </Navigation>
    </div>
  );
};

export default PublicMentor;
