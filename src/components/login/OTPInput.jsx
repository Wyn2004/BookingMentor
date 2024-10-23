import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { Button } from '../index';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { checkExistEmail, checkOtpCorrect } from '../../apis/UserServices';
import icons from '../../utils/icon';

const OTPInput = () => {
  const [disable, setDisable] = useState(false); // Trạng thái vô hiệu hóa nút
  const [timerCount, setTimerCount] = useState(30); // Thời gian đếm ngược (30 giây)
  const [otp, setOtp] = useState(['', '', '', '', '']); // State cho từng ô OTP
  const navigate = useNavigate();
  const { email, setStoreOTP } = useUserStore();
  const { FaSignInAlt } = icons;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Đếm ngược thời gian cho việc gửi lại OTP
    let interval;
    if (disable && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
    } else if (timerCount === 0) {
      setDisable(false);
      setTimerCount(30); // Reset thời gian sau khi hết hạn
    }
    return () => clearInterval(interval);
  }, [disable, timerCount]);

  const handleResendClick = () => {
    if (disable) return; // Nếu disable là true, không thực thi tiếp
    handleResendOtp();
    setDisable(true); // Vô hiệu hóa nút
    setTimerCount(30); // Đặt lại thời gian đếm ngược về 30 giây
    // Logic gửi lại OTP
  };

  const onFinish = values => {
    const enteredOtp = otp.join('');
    const dataSent = {
      otpCode: enteredOtp,
      email: email
    };
    handleCheckOtp(dataSent);
  };

  const handleResendOtp = async () => {
    const dataSent = {
      email: email
    };
    const response = await checkExistEmail(dataSent);
  };

  const handleCheckOtp = async dataSend => {
    setIsLoading(true);
    const response = await checkOtpCorrect(dataSend);
    setIsLoading(false);
    if (response?.statusCode === 200) {
      toast.success('OTP matched');
      setStoreOTP(dataSend.otpCode);
      navigate('/public/change-password');
    } else {
      toast.error('OTP did not match.');
    }
  };

  // Hàm kiểm tra tất cả các ô OTP
  const otpValidator = () => {
    return otp.some(val => val === '') ? Promise.reject(new Error('Please input OTP!')) : Promise.resolve();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index] === '') {
        // Nếu ô hiện tại đã rỗng, di chuyển focus về ô trước đó
        if (index > 0) {
          const previousInput = document.getElementById(`otp${index - 1}`);
          if (previousInput) {
            previousInput.focus();
          }
        }
      } else {
        // Nếu ô hiện tại có ký tự, chỉ xóa ký tự tại ô đó
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleChange = (event, index) => {
    const value = event.target.value;

    // Kiểm tra nếu ký tự nhập vào là số
    if (/^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value; // Cập nhật giá trị ô hiện tại
      setOtp(newOtp);

      // Chuyển focus đến ô tiếp theo nếu có
      if (value.length === 1 && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return (
    <div className="w-full h-min-heigh-custom flex items-center justify-center">
      <div className="w-5/3 sm:w-2/3 md:w-1/3 shadow-2xl p-6 border flex flex-col items-center justify-center rounded-lg">
        <h1 className="text-3xl font-semibold text-orange-600 font-Merriweather text-center">Email Verification</h1>
        <p className="flex flex-row pb-8 text-sm font-medium text-gray-400">We have sent a code to your email</p>
        <div>
          <Form
            name="send_otp"
            onFinish={onFinish}
            initialValues={{
              otp: ['', '', '', '', '']
            }}
          >
            {/* Form.Item chứa tất cả 5 ô input */}
            <Form.Item
              name="otp"
              rules={[
                {
                  validator: otpValidator // Sử dụng validator để kiểm tra tất cả các ô
                }
              ]}
            >
              <div className="flex flex-wrap items-center justify-center mx-auto w-full space-x-4 sm:space-x-2">
                {[0, 1, 2, 3, 4].map(index => (
                  <div className="w-16 h-16 sm:w-12 sm:h-12" key={index}>
                    <input
                      maxLength="1"
                      className="w-full h-full flex items-center justify-center text-center px-3 outline-none rounded-xl border-4 border-gray-300 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                      type="text"
                      value={otp[index]}
                      onChange={event => handleChange(event, index)}
                      onKeyDown={event => handleKeyDown(event, index)}
                      id={`otp${index}`}
                    />
                  </div>
                ))}
              </div>
            </Form.Item>

            <Form.Item className="flex items-center justify-center w-full">
              <Button
                textColor="text-white"
                bgColor="bg-main-1"
                bgHover="hover:bg-main-2"
                text={'Verify Account'}
                htmlType="submit"
                isLoading={isLoading}
                IcBefore={FaSignInAlt}
              />
            </Form.Item>

            <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
              <p>Didn't receive code?</p>
              <a
                className="flex flex-row items-center"
                style={{
                  color: disable ? 'gray' : 'blue',
                  cursor: disable ? 'not-allowed' : 'pointer',
                  textDecorationLine: disable ? 'none' : 'underline'
                }}
                onClick={handleResendClick}
              >
                {disable ? `Resend OTP in ${timerCount}s` : 'Resend OTP'}
              </a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
