import { Button, Form, Input, message, Modal, Select, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { getAllSemester } from '../../apis/SemesterServices';
import { createTopic, deleteTopic, getAllTopic, getTopicByIdSemester, updateTopic } from '../../apis/TopicServices';
import { getAllMentors } from '../../apis/MentorServices';

const TopicManager = () => {
  const [semesters, setSemesters] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const { Option } = Select;

  useEffect(() => {
    const fetchSemesters = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getAllSemester(token);
        setSemesters(response.data?.semesterDTOList);
      } catch (err) {
        setError(err?.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (semesters?.length > 0) {
      setSelectedSemester(semesters[0].id);
    }
  }, [semesters]);

  useEffect(() => {
    const fetchAllTopicBySemesterId = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log(selectedSemester);
        const response = await getTopicByIdSemester(selectedSemester, token);
        console.log(response);
        response?.statusCode === 200 ? setTopics(response?.topicDTOList) : setTopics([]);
      } catch (err) {
        setError(err?.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    setLoading(false);
    fetchAllTopicBySemesterId();
  }, [selectedSemester]);

  useEffect(() => {
    const fetchMentors = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await getAllMentors(token);
        setMentors(response.mentorsDTOList);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleCreateTopic = async () => {
    const token = localStorage.getItem('token');
    try {
      // Xác thực form và lấy dữ liệu
      const values = await form.validateFields();

      const dataCreate = {
        topicName: values.topicName,
        context: values.context,
        problems: values.problems,
        actor: values.actors.split('\n'),
        requirement: values.requirements.split('\n'),
        nonFunctionRequirement: values.nonFunctionRequirements.split('\n'),
        semesterDTO: {
          id: values.semesterId
        },
        mentorsDTO: {
          id: values.mentorId
        }
      };
      console.log(dataCreate);
      const response = await createTopic(dataCreate, token);
      console.log(response);
      if (response?.statusCode === 200 && response?.topicDTO) {
        setTopics([...topics, response.topicDTO]);
        setIsCreateModalVisible(false);
        message.success('Topic created successfully');
      } else {
        message.error('Failed to create topic');
      }
    } catch (error) {
      console.error('Create topic error:', error);
      message.error('Failed to create topic: ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      const values = await form.validateFields();
      const dataUpdate = {
        topicName: values.topicName,
        context: values.context,
        problems: values.problems,
        actor: values.actors.split('\n'),
        requirement: values.requirements.split('\n'),
        nonFunctionRequirement: values.nonFunctionRequirements.split('\n'),
        semesterDTO: {
          id: values.semesterId
        },
        mentorsDTO: {
          id: values.mentorId
        }
      };

      const response = await updateTopic(selectedTopic.id, dataUpdate, token);

      if (response?.statusCode === 200 && response?.topicDTO) {
        // Cập nhật lại danh sách chủ đề với thông tin mới
        setTopics(prevTopics =>
          prevTopics.map(topic => (topic.id === response.topicDTO.id ? response.topicDTO : topic))
        );
        setIsUpdateModalVisible(false);
        message.success('Topic updated successfully');
      } else {
        message.error('Failed to update topic');
      }
    } catch (error) {
      console.error('Update topic error:', error);
      message.error('Failed to update topic: ' + error.message);
    }
  };

  const showUpdateModal = topic => {
    if (!topic) return;

    setSelectedTopic(topic);

    // Cập nhật lại giá trị cho các trường trong form, với các tên trường khớp với tên trong dữ liệu topic
    form.setFieldsValue({
      topicName: topic.topicName,
      context: topic.context,
      problems: topic.problems,
      actors: topic.actor ? topic.actor.join('\n') : '',
      requirements: topic.requirement ? topic.requirement.join('\n') : '',
      nonFunctionRequirements: topic.nonFunctionRequirement ? topic.nonFunctionRequirement.join('\n') : '',
      semesterId: topic.semesterDTO?.id || null,
      mentorId: topic.mentorsDTO?.id || null
    });

    setIsUpdateModalVisible(true); // Hiển thị modal cập nhật
  };

  const handleDelete = async idTopic => {
    const token = localStorage.getItem('token');
    try {
      const response = await deleteTopic(idTopic, token);

      if (response && response.statusCode === 200) {
        message.success('Topic deleted successfully');
        setTopics(prevTopic => prevTopic.filter(topic => topic.id !== idTopic)); // Cập nhật danh sách người dùng
      } else {
        message.error('Failed to delete topic: ' + response.data.message);
      }
    } catch (error) {
      console.error('Delete topic error:', error);
      message.error('Failed to delete topic: ' + error.message);
    }
  };

  const handleCancelUpdate = () => {
    form.resetFields();
    setIsUpdateModalVisible(false);
  };

  const showCreateModal = () => {
    setSelectedTopic(null); // Không chọn user nào vì đang tạo mới
    form.resetFields(); // Xóa các giá trị trong form
    setIsCreateModalVisible(true); // Hiển thị modal tạo người dùng
  };

  const handleCancelCreate = () => {
    form.resetFields();
    setIsCreateModalVisible(false);
  };

  if (loading) {
    return <div className="text-center text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Topic Name',
      dataIndex: 'topicName',
      key: 'topicName',
      className: 'whitespace-pre-line text-left align-top w-[100px]'
    },
    {
      title: 'Context',
      dataIndex: 'context',
      key: 'context',
      className: 'whitespace-pre-line text-left align-top w-[1000px]'
    },
    {
      title: 'Problem',
      dataIndex: 'problems',
      key: 'problems',
      className: 'whitespace-pre-line text-left align-top w-[1000px]'
    },
    {
      title: 'Actors',
      dataIndex: 'actor',
      key: 'actor',
      className: 'whitespace-pre-line text-left align-top',
      render: actors => (
        <>
          {actors?.map((actor, index) => {
            let color = actor.length > 6 ? 'geekblue' : 'green';
            if (
              actor.toUpperCase().includes('ADMIN') ||
              actor.toUpperCase().includes('MANAGER') ||
              actor.toUpperCase().includes('SYSTEM')
            ) {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={index} className="inline-block mt-1 w-[180px]">
                {actor.toUpperCase()}
              </Tag>
            );
          })}
        </>
      )
    },
    {
      title: 'Functional Requirements',
      dataIndex: 'requirement',
      key: 'requirement',
      className: 'whitespace-pre-line text-left align-top',
      render: requirements => (
        <>
          {requirements.map((requirement, index) => (
            <p key={index} className="w-[800px]">
              {requirement}
            </p>
          ))}
        </>
      )
    },
    {
      title: 'Non-Functional Requirements',
      dataIndex: 'nonFunctionRequirement',
      key: 'nonFunctionRequirement',
      className: 'whitespace-pre-line text-left align-top',
      render: nf_requirements => (
        <>
          {nf_requirements.map((nf_requirement, index) => (
            <p key={index} className="w-[300px]">
              {nf_requirement}
            </p>
          ))}
        </>
      )
    },
    {
      title: 'Mentor',
      dataIndex: 'mentorsDTO',
      key: 'mentorsDTO',
      className: 'whitespace-pre-line text-left align-top',
      render: mentor => mentor?.user?.fullName || 'N/A'
    },
    {
      title: 'Semester',
      dataIndex: 'semesterDTO',
      key: 'semesterDTO',
      className: 'whitespace-pre-line text-left align-top',
      render: semester => semester?.semesterName || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            className="bg-blue-500 text-white  w-full"
            onClick={() => showUpdateModal(record)}
            style={{ marginRight: '10px' }}
          >
            Update
          </Button>
          <Button className="bg-red-500 text-white  w-full" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full h-full bg-gray-100 p-2">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Topic List</h1>

      <Button type="primary" onClick={showCreateModal} style={{ marginBottom: '10px' }}>
        Create Topic
      </Button>
      <div className="w-[10vw] mb-3">
        <Select
          placeholder="Select Semester"
          value={selectedSemester}
          onChange={value => setSelectedSemester(value)}
          style={{ backgroundColor: '#F3F4F6', width: '100%' }}
          className="rounded-lg shadow-sm border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
        >
          {semesters?.map(semester => (
            <Select.Option key={semester.id} value={semester.id}>
              {semester.semesterName}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table
        columns={columns}
        bordered
        dataSource={topics}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: '1000px' }}
      />

      {/* Modal for updating student */}
      <Modal title="Update Topic" open={isUpdateModalVisible} onOk={handleUpdate} onCancel={handleCancelUpdate}>
        <div className="max-h-96 overflow-y-auto p-5">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Topic Name"
              name="topicName"
              rules={[
                {
                  required: true,
                  message: 'Please input the topic name!'
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Context"
              name="context"
              rules={[
                {
                  required: true,
                  message: 'Please input the context!'
                }
              ]}
            >
              <Input.TextArea rows={7} />
            </Form.Item>
            <Form.Item
              label="Problem"
              name="problems"
              rules={[
                {
                  required: true,
                  message: 'Please input the problem!'
                }
              ]}
            >
              <Input.TextArea rows={7} />
            </Form.Item>
            <Form.Item
              label="Actors"
              name="actors"
              rules={[
                {
                  required: true,
                  message: 'Please input the actors!'
                }
              ]}
            >
              <Input.TextArea rows={7} placeholder="Enter actors (one per line)" />
            </Form.Item>
            <Form.Item
              label="Functional Requirements"
              name="requirements"
              rules={[
                {
                  required: true,
                  message: 'Please input the functional requirements!'
                }
              ]}
            >
              <Input.TextArea rows={7} placeholder="Enter functional requirements (one per line)" />
            </Form.Item>
            <Form.Item label="Non-Functional Requirements" name="nonFunctionRequirements">
              <Input.TextArea rows={7} placeholder="Enter non-functional requirements (one per line)" />
            </Form.Item>
            <Form.Item
              label="Semester"
              name="semesterId"
              rules={[
                {
                  required: true,
                  message: 'Please select a semester!'
                }
              ]}
            >
              <Select placeholder="Select Semester">
                {semesters?.map(semester => (
                  <Select.Option key={semester.id} value={semester.id}>
                    {semester.semesterName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Mentor"
              name="mentorId"
              rules={[
                {
                  required: true,
                  message: 'Please select a mentor!'
                }
              ]}
            >
              <Select placeholder="Select Mentor">
                {mentors?.map(mentor => (
                  <Select.Option key={mentor.id} value={mentor.id}>
                    {mentor.user.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Modal for creating topic */}
      <Modal
        title="Create New Topic"
        open={isCreateModalVisible}
        onOk={handleCreateTopic}
        onCancel={handleCancelCreate}
      >
        <div className="max-h-96 overflow-y-auto p-5">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Topic Name"
              name="topicName"
              rules={[
                {
                  required: true,
                  message: 'Please input the topic name!'
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Context"
              name="context"
              rules={[
                {
                  required: true,
                  message: 'Please input the context!'
                }
              ]}
            >
              <Input.TextArea rows={7} />
            </Form.Item>
            <Form.Item
              label="Problem"
              name="problems"
              rules={[
                {
                  required: true,
                  message: 'Please input the problem!'
                }
              ]}
            >
              <Input.TextArea rows={7} />
            </Form.Item>
            <Form.Item
              label="Actors"
              name="actors"
              rules={[
                {
                  required: true,
                  message: 'Please input the actors!'
                }
              ]}
            >
              <Input.TextArea rows={7} placeholder="Enter actors (one per line)" />
            </Form.Item>
            <Form.Item
              label="Functional Requirements"
              name="requirements"
              rules={[
                {
                  required: true,
                  message: 'Please input the functional requirements!'
                }
              ]}
            >
              <Input.TextArea rows={7} placeholder="Enter functional requirements (one per line)" />
            </Form.Item>
            <Form.Item label="Non-Functional Requirements" name="nonFunctionRequirements">
              <Input.TextArea rows={7} placeholder="Enter non-functional requirements (one per line)" />
            </Form.Item>
            <Form.Item
              label="Semester"
              name="semesterId"
              rules={[
                {
                  required: true,
                  message: 'Please select a semester!'
                }
              ]}
            >
              <Select placeholder="Select Semester">
                {semesters?.map(semester => (
                  <Select.Option key={semester.id} value={semester.id}>
                    {semester.semesterName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Mentor"
              name="mentorId"
              rules={[
                {
                  required: true,
                  message: 'Please select a mentor!'
                }
              ]}
            >
              <Select placeholder="Select Mentor">
                {mentors?.map(mentor => (
                  <Select.Option key={mentor.id} value={mentor.id}>
                    {mentor.user.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TopicManager;
