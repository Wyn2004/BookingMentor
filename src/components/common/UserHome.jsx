import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import path from '../../utils/path';
import { getAllSkill } from '../../apis/SkillServices';
import { getAllMentorByNameSkillDate } from '../../apis/MentorServices';
import { DatabaseOutlined, GithubOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReact, faNodeJs, faHtml5 } from '@fortawesome/free-brands-svg-icons';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import PublicFoot from '../../pages/public/PublicFoot';

// Hàm lấy dữ liệu kỹ năng
const fetchSkills = async () => {
  return [
    { id: 1, name: 'Database', icon: <DatabaseOutlined className="flex justify-center" /> },
    { id: 2, name: 'Github', icon: <GithubOutlined className="flex justify-center" /> },
    { id: 3, name: 'ReactJS', icon: <FontAwesomeIcon icon={faReact} className="flex justify-center" /> },
    { id: 4, name: 'NodeJS', icon: <FontAwesomeIcon icon={faNodeJs} className="flex justify-center" /> },
    { id: 5, name: 'Spring Boot', icon: <FontAwesomeIcon icon={faLeaf} className="flex justify-center" /> },
    { id: 6, name: 'HTML/CSS', icon: <FontAwesomeIcon icon={faHtml5} className="flex justify-center" /> }
  ];
};

// Hàm lấy dữ liệu mentor giả lập
const fetchMentors = async () => {
  return [
    { mentorCode: 'M001', mentorName: 'John Doe', skills: ['Database', 'ReactJS'] },
    { mentorCode: 'M002', mentorName: 'John Wick', skills: ['NodeJS', 'HTML/CSS'] },
    { mentorCode: 'M003', mentorName: 'John Stone', skills: ['Github', 'Spring Boot'] }
  ];
};

const UserHome = () => {
  const [mentors, setMentors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const skillFromUrl = searchParams.get('skill') || '';
  const [searchPayload, setSearchPayload] = useState({
    name: '',
    skill: skillFromUrl ? [skillFromUrl] : [],
    date: ''
  });

  // Lấy danh sách top mentor
  useEffect(() => {
    const loadMentors = async () => {
      const fetchedMentors = await fetchMentors();
      setMentors(fetchedMentors);
    };

    loadMentors();
  }, []);

  // Lấy danh sách skills
  useEffect(() => {
    const fetchSkill = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getAllSkill(token);
        setSkills(response.data.skillsDTOList);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, []);

  //     useEffect(() => {
  //   const fetchMentorByCondition = async () => {
  //     const token = localStorage.getItem('token');
  //     try {
  //       const skills = searchPayload?.skill?.length > 0 ? searchPayload.skill.join(',') : undefined;
  //       const name = searchPayload?.name || '';
  //       const availableFrom = searchPayload?.date[0]?.format('DD-MM-YYYY HH:mm') || undefined;
  //       const availableTo = searchPayload?.date[1]?.format('DD-MM-YYYY HH:mm') || undefined;
  //       const response = await getAllMentorByNameSkillDate(name, skills, availableFrom, availableTo, token);
  //       if (response && response.statusCode === 200) setMentors(response.mentorsDTOList);
  //       else setMentors([]);
  //     } catch (error) {
  //       setError(error.message || 'Đã xảy ra lỗi');
  //     }
  //   };
  //   fetchMentorByCondition();
  // }, [searchPayload]);

  return (
    <div className="flex flex-col">
      {/* Header: Top Mentor */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="row mb-5 flex justify-center font-bold text-xl text-main-1">Top3 Mentors of the Week</div>
        <div className="flex justify-between items-center p-3 ">
          {mentors.map(mentor => (
            <div key={mentor.mentorCode} className="w-1/3 p-2 border-2 shadow-2xl mr-5">
              <div className="relative overflow-visible">
                <div
                  className="relative overflow-hidden transition-transform duration-300 ease-in-out transform hover:-translate-y-8"
                  data-animation="true"
                >
                  <div className="flex justify-center mt-n4 mx-3">
                    <img
                      src="/public/banner1.png"
                      alt={mentor.mentorName}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-col flex-grow text-center p-2">
                  <p className="text-lg font-bold text-red-500">{mentor.mentorName}</p>
                  <p className="text-dark">{mentor.mentorCode}</p>
                  <p className="text-dark">{mentor.skills.join(', ')}</p>
                </div>
                <div className="flex justify-center">
                  <Button
                    text={'View Profile'}
                    fullWidth={'w-full'}
                    htmlType={'text'}
                    bgColor={'bg-blue-500'}
                    textColor={'text-white'}
                    textSize={'text-sm'}
                    to={`${path.USER_PROFILE}/hehe/haha`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="gap-3 pt-5">
        <div className="bg-white p-8 rounded-lg border-2 shadow-2xl">
          <div className="row mb-5 flex justify-center font-bold text-xl text-main-1">Skills</div>
          <div className="flex justify-between overflow-x-auto p-3" style={{ overflowY: 'hidden' }}>
            {skills.map(skill => (
              <Link
                key={skill.id}
                to={`${path.USER_VIEW_MENTOR}?skill=${skill?.id}`}
                className="bg-white p-5 rounded-lg border-2 shadow-2xl flex flex-col items-center mx-2 transition-transform duration-300 hover:scale-105"
                style={{ flex: '0 0 15.35%' }}
              >
                {skill.icon}
                <div className="mt-2 text-dark text-center">{skill.skillName}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="flex gap-3 pt-5 pb-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-1/3">
          <div className="flex flex-col justify-center items-center text-center">
            <h2 className="font-bold text-xl pb-5">Wide Networking</h2>
            <p>
              Connect to reputation mentors all over the campus. Just stay at home and learn with mentor through our
              website.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg w-1/3">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-bold text-xl pb-5">Easy & Fast</h2>
            <p>Choose mentors and book sessions in just few steps. Search fast with our helpful filter.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg w-1/3">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-bold text-xl pb-5">Upgrade Your Skills</h2>
            <p>Find your topic and gain knowlege, then improve your skill with our experienced mentors.</p>
          </div>
        </div>
      </div>
      {/* <div className="pt-20 relative ">
        <PublicFoot />
      </div> */}
    </div>
  );
};

export default UserHome;
