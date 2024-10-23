import React, { useState, useCallback, useEffect } from 'react';
import { getMyProfile, getProfileById } from '../../apis/UserServices';
import CopyAction from './CopyAction';
import { toast } from 'react-toastify';
import { useUserStore } from '../../store/useUserStore';
import { useParams, useSearchParams } from 'react-router-dom';
import { Crop, Send } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton
} from '@mui/material';
import CropEasy from './CropEasy';
import { Modal, message, Dropdown, Menu } from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';

function StudentProfile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useUserStore();
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const { name, id } = useParams();
  const [openCrop, setOpenCrop] = useState(false);
  const [photoURL, setPhotoURL] = useState(null); // Lưu URL ảnh sau khi upload
  const [file, setFile] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [openAvatarModal, setOpenAvatarModal] = useState(false); // Trạng thái mở modal
  const [isAvatarVisible, setIsAvatarVisible] = useState(false); // Trạng thái hiển thị modal avatar
  const [modalUpdateAvatar, setModalUpdateAvatar] = useState(false);

  let roleProfile = name ? name.toUpperCase() : role;

  // Cập nhật trạng thái dữ liệu khi có thay đổi (có modal)
  const handleDataChanged = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPhotoURL(URL.createObjectURL(selectedFile)); // Lưu URL của ảnh
      setModalUpdateAvatar(true); // Mở modal
    }
  };

  // Menu dropdown khi nhấn vào avatar
  const menuItems = [
    {
      key: 'upload',
      label: (
        <label style={{ cursor: 'pointer' }}>
          <UploadOutlined className="pr-2" /> Upload Avatar
          <input type="file" accept="image/*" hidden onChange={handleDataChanged} />
        </label>
      )
    },
    {
      key: 'view',
      label: (
        <span onClick={() => setIsAvatarVisible(true)}>
          <EyeOutlined className="pr-3" /> View Avatar
        </span>
      )
    }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      if (file) {
        const url = await uploadFile(file); // Thêm xử lý upload ảnh
        profile.photo = url; // Cập nhật avatar với URL mới
        await updateAvatar(profile.photo); // Call the API to update the avatar in the backend
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalUpdateAvatar(false); // Đóng modal bằng cách thay đổi trạng thái modal
    setPhotoURL(''); // Reset lại URL ảnh nếu cần
    setFile(null); // Reset lại file nếu cần
  };

  // Hàm xử lý khi tải ảnh lên
  const handleUpload = file => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoURL(reader.result); // Cập nhật URL ảnh
    };
    reader.readAsDataURL(file);
    return false;
  };

  // Hàm xử lý lưu avatar
  const handleSaveAvatar = async () => {
    if (photoURL) {
      try {
        // Thực hiện upload ảnh lên server tại đây
        await uploadFile(file); // Upload file
        message.success('Avatar updated successfully!');
        setOpenAvatarModal(false); // Đóng modal sau khi lưu thành công
      } catch (error) {
        message.error('Failed to update avatar.');
      }
    } else {
      message.error('Please upload an image first!');
    }
  };

  const copyToClipboard = text => event => {
    window.navigator.clipboard ?.writeText(text)
      .then(() => {
        const tipText = 'Text copied';
        toast.success(tipText, {
          autoClose: 500, // thời gian tự động đóng thông báo (500ms)
          style: {
            position: { of: event.currentTarget, offset: '0 -30' }, // Sử dụng event.currentTarget
            minWidth: `${tipText.length + 2}ch`, // Thiết lập độ rộng tối thiểu
            width: 'auto'
          }
        });
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const onCopyHandler = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000); // Hide the success message after 1 seconds
  };

  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const updateAvatar = async avatarUrl => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token không tồn tại');

    const response = await updateAvatarApi(token, { avatar: avatarUrl });
    if (response.error) throw new Error(response.error); // Handle error response from API
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token không tồn tại');
          return;
        }

        // Gọi API để lấy profile
        const response = id ? await getProfileById(id, token) : await getMyProfile(token);
        // console.log('get profile: ', response);

        console.log('Role:', roleProfile);
        const user = roleProfile === 'MENTOR' ? response?.mentorsDTO : response?.studentsDTO;

        // Kiểm tra dữ liệu trả về từ API
        console.log('User DTO:', user);

        // Lấy group cho STUDENT
        const group = response?.groupDTO;

        // Cập nhật state với dữ liệu từ API
        setProfile({
          code: roleProfile == 'MENTOR' ? user?.mentorCode : user?.studentCode,
          userName: user?.user?.username || '',
          fullName: user?.user?.fullName || '',
          email: user?.user?.email || '',
          birthDate: user?.user?.birthDate || '',
          photo: user?.user?.avatar || '/public/cover.jpg',
          address: user?.user?.address || '',
          phone: user?.user?.phone || '',
          gender: user?.user?.gender || '',
          point: roleProfile === 'MENTOR' ? user?.star : user?.point,
          expertise:
            roleProfile === 'MENTOR' ? user?.skills?.map(skill => skill.skillName).join(', ') : user?.expertise,
          className: roleProfile === 'MENTOR' ? user?.assignedClass?.className : user?.aclass?.className,
          timeRemain: user?.totalTimeRemain || '',
          groupProject: group?.project?.projectName || '',
          groupRole: user?.groupRole || ''
        });
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full mx-auto p-2 items-center flex justify-center flex-col">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 w-[80vw] relative flex flex-col pb-2">
        <div className="h-[calc(20vh+100px)]">
          <img
            // Background image
            src={'/public/cover.jpg'}
            alt="Profile"
            className="w-full object-cover h-[20vh] rounded-tl-md rounded-tr-md"
          />
          <div className="flex items-center justify-center absolute inset-0 mt-[10vh] mx-auto bg-white w-[170px] rounded-full z-[999] h-[170px]">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              {/* Bọc img trong một thẻ div hoặc span */}
              <div>
                <img
                  src={photoURL || profile?.photo || '/public/placeholder.jpg'}
                  alt="cover"
                  className="w-[150px] h-[150px] rounded-full object-cover"
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </Dropdown>

            <Modal
              title="View Avatar"
              open={isAvatarVisible}
              onCancel={() => setIsAvatarVisible(false)}
              footer={null}
            >
              <img src={profile.photo} alt="Avatar" style={{ width: '100%', height: 'auto' }} />
            </Modal>

            <Dialog open={modalUpdateAvatar}>
              <DialogTitle>Upload Avatar</DialogTitle>
              {/* <DialogContent dividers sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', height: 150 }}>                
                <Box>
                  <label htmlFor="profilePhoto">
                    <input
                      accept="image/*"
                      id="profilePhoto"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleDataChanged}
                    />
                    <Avatar src={photoURL} sx={{ width: 75, height: 75, cursor: 'pointer' }} />
                  </label>
//                  {file && (
//                    <IconButton aria-label="Crop" color="primary" onClick={() => setOpenCrop(true)}>
//                      <Crop />
//                    </IconButton>
//                  )} 
                </Box>
              </DialogContent> */}
              <DialogContent
                dividers
                sx={{
                  display: 'flex',
                  flexDirection: 'column', // Stack children vertically
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  height: 150
                }}
              >
                <Box>
                  <label htmlFor="profilePhoto">
                    <input
                      accept="image/*"
                      id="profilePhoto"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleDataChanged}
                    />
                    <Avatar src={photoURL} sx={{ width: 75, height: 75, cursor: 'pointer' }} />
                  </label>

                  {/* Uncomment if you want to show the crop button */}
                  {/* {file && (
                        <IconButton aria-label="Crop" color="primary" onClick={() => setOpenCrop(true)}>
                          <Crop />
                        </IconButton>
                      )} */}
                </Box>
              </DialogContent>

              <DialogActions>
                {/* Nút Cancel */}
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" endIcon={<Send />} type="submit">
                  Submit
                </Button>
              </DialogActions>
              <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setFile }} />
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col items-center mt">
          <h1 className="text-3xl font-semibold">{roleProfile}</h1>
          <h2 className="text-xl text-gray-900">{profile?.fullName}</h2>
          <div className="subtitle-text with-clipboard-copy">
            <span>
              {capitalizeFirstLetter(roleProfile)} Code: {profile.code}
            </span>
            <CopyAction
              className="copy-clipboard-button"
              stylingMode="text"
              onClick={copyToClipboard(profile.code)} // Sử dụng profile.id
              activeStateEnabled={false}
              focusStateEnabled={false}
              hoverStateEnabled={false}
            >
              <img src="/public/clipboard-icon.png" alt="Copy to clipboard" className="inline-block w-4 h-4 ml-1" />
            </CopyAction>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex gap-3 w-[80vw]">
        {/* Contact and Address Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-2/5">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact & Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium">Phone</label>
              <input
                type="text"
                value={profile.phone}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Email</label>
              <input
                type="text"
                value={profile.email}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium">Address</label>
              <input
                type="text"
                value={profile.address}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-3/5">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{capitalizeFirstLetter(roleProfile)} Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Gender</label>
              <input
                type="text"
                value={profile.gender}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Birth Date</label>
              <input
                type="text"
                value={profile.birthDate}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Class</label>
              <input
                type="text"
                value={profile.className}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Nếu là mentor thì hiển thị Time Remain */}
            {roleProfile === 'MENTOR' && (
              <div>
                <label className="block text-gray-700 text-sm font-medium">Time Remain</label>
                <input
                  type="text"
                  value={profile.timeRemain}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium">
                {roleProfile === 'MENTOR' ? 'Star' : 'Point'}
              </label>
              <input
                type="text"
                value={profile.point}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            <div className={roleProfile === 'MENTOR' ? 'md:col-span-2' : ''}>
              <label className="block text-gray-700 text-sm font-medium">
                {roleProfile === 'MENTOR' ? 'Skill' : 'Expertise'}
              </label>
              <input
                type="text"
                value={profile.expertise}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Nếu là student thì hiển thị Group Project và Role In Group */}
            {roleProfile === 'STUDENT' && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium">Group Project</label>
                  <input
                    type="text"
                    value={profile.groupProject}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium">Role In Group</label>
                  <input
                    type="text"
                    value={profile.groupRole}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;