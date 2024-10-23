import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import path from '../../utils/path';
import Search from './Search';
import UserItem from './UserItem';
import { useUserStore } from '../../store/useUserStore';
import { getStudentByIdAndSearch } from '../../apis/StudentServices';
import { capitalizeFirstLetter, convertSkillArray } from '../../utils/commonFunction';

const ClassList = ({ addGroup }) => {
  const [countMember, setCountMember] = useState(0);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

  const [searchPayload, setSearchPayload] = useState({
    name: '',
    expertise: ''
  });

  const navigate = useNavigate();
  const { userData, mentorOfClass, role } = useUserStore();
  console.log(mentorOfClass);

  useEffect(() => {
    const fetchStudentByIdAndSearch = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await getStudentByIdAndSearch(
          userData?.aclass.id,
          searchPayload?.name || undefined,
          searchPayload?.expertise || undefined,
          token
        );
        if (response && response.statusCode === 200) setStudents(response.studentsDTOList);
        else setStudents([]);
      } catch (error) {
        setError(error.message || 'Đã xảy ra lỗi');
      }
    };
    fetchStudentByIdAndSearch();
  }, [userData, searchPayload]);

  useEffect(() => {
    if (countMember >= 4) {
      navigate(`/${path.PUBLIC_STUDENT}/${path.STUDENT_GROUP}`);
      toast.success('Create Project Successfully!');
    }
  }, [countMember]);

  return (
    <div className="w-full h-full flex flex-col break-words gap-3">
      <Search setPayload={setSearchPayload} />
      {addGroup && <p className="text-2xl font-semibold text-red-500">Limit member: {countMember}/4</p>}
      <div className=" bg-white flex flex-col gap-5 p-3 rounded-md">
        {!addGroup && mentorOfClass && role === 'STUDENT' && (
          <UserItem
            roleItem={'Mentor'}
            name={mentorOfClass?.mentorInf?.fullName}
            specialized={convertSkillArray(mentorOfClass?.mentorSkill)}
            gender={mentorOfClass?.mentorInf?.gender}
            star={userData?.aclass?.mentor?.star}
            sameClass={true}
            idUser={mentorOfClass?.mentorInf?.id}
            code={userData?.aclass?.mentor?.mentorCode}
            avatar={mentorOfClass?.mentorInf?.avatar}
          />
        )}
        {students?.length === 0 ? (
          <p className="text-red-500">No students were found.</p>
        ) : (
          students?.map(student => (
            <UserItem
              key={student.id}
              roleItem={capitalizeFirstLetter(student?.user?.role?.roleName)}
              specialized={student?.expertise}
              name={student?.user?.fullName}
              gender={student?.user?.gender}
              isAdded={false}
              idUser={student?.user?.id}
              code={student?.studentCode}
              avatar={student?.user?.avatar}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ClassList;
