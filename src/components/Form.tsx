/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Spin,
  Typography
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { getCookie, host } from 'utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

export default function DataForm(props: { mode: string; id?: string }) {
  const [loaded, setLoaded] = useState(props.mode === 'new')
  const [messageApi, contextHolder] = message.useMessage()
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [memberNames, setMemberNames] = useState([''] as Array<string>)
  const [initialValues, setInitialValues] = useState({ members: [{}] })
  const federations: Array<string> = [
    'NASIMCO',
    'The Council of European Jamaats',
    'India Federation',
    'Pakistan Federation',
    'Federation of Australasian Communities',
    'Africa Federation'
  ]
  const params = useParams()

  const handleSubmit = async (values: any) => {
    console.log(values)
    setLoading(true)
    values.members = values.members.map((member: any) => {
      member.birthday = member.birthday.format('YYYY-MM-DD')
      return member
    })
    if (props.mode === 'new') {
      const res = await fetch(`${host}/record`, {
        method: 'post',
        body: JSON.stringify(values),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
    } else {
      const res = await fetch(`${host}/record/${params.id}`, {
        method: 'put',
        body: JSON.stringify(values),
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
    }
    setDone(true)
    setLoading(false)
  }
  const handleFail = () => {
    messageApi.error(
      'Unable to submit form. Please ensure that you have filled all required fields and try again.'
    )
  }

  useEffect(() => {
    if (props.mode === 'new') {
      return
    }
    setLoading(true)
    fetch(`${host}/record/${params.id}`, {
      // @ts-expect-error TS BEING DUMB
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
      },
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        }
        throw new Error()
      })
      .then((json) => {
        if (json) {
          json.members = json.members.map((member: any) => {
            member.birthday = dayjs(member.birthday, 'YYYY-MM-DD')
            return member
          })
          setInitialValues(json)
          setLoading(false)
          setLoaded(true)
        }
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [])

  if (!loaded) {
    return (
      <Flex
        gap="small"
        className="h-screen w-screen"
        align="center"
        justify="center"
      >
        <Spin size="large"></Spin>
      </Flex>
    )
  }
  return (
    <div className="my-4 flex flex-col">
      {contextHolder}
      {loading && (
        <Alert showIcon type="info" message="Submitting your form..." />
      )}
      {done && (
        <Alert
          showIcon
          type="success"
          message="Thank you for registering"
          description={`We would like to sincerely thank you for taking the time out to provide 
          yours and your household's data as part of the World Federation census. Using this data, we will be able to make
          informed decisions on our community's future initiatives and projects. Be rest assured that your data is being stored
          in a safe and secure manner.`}
        />
      )}
      {!done && !loading && (
        <>
          <Form
            id="order-form"
            form={form}
            autoComplete="off"
            initialValues={initialValues}
            layout="vertical"
            className="mb-20 mt-4"
            onFinish={handleSubmit}
            onFinishFailed={handleFail}
          >
            <Flex wrap gap={'0px 12px'}>
              <Form.Item
                className="w-full sm:w-80"
                label="Federation"
                name="federation"
                rules={[
                  {
                    required: true,
                    message: 'Name of the federation is required.'
                  }
                ]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label?.toString().toLowerCase() ?? '').includes(
                      input.toString().toLowerCase()
                    )
                  }
                  options={federations.map((opt: string) => ({
                    value: opt,
                    label: opt
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Name of local jamaat"
                name="jamaat"
                rules={[
                  { required: true, message: 'Name of jamaat is required.' }
                ]}
              >
                <Input className="w-full sm:w-80" />
              </Form.Item>
              <Form.Item
                label="Current Address"
                name="address"
                rules={[
                  {
                    required: true,
                    message: 'Address of the family is required.'
                  }
                ]}
              >
                <Input className="w-full sm:w-80" />
              </Form.Item>
            </Flex>
            <Form.List
              name="members"
              rules={[
                {
                  validator: async (_, items) => {
                    if (!items || items.length < 1) {
                      return Promise.reject(
                        new Error('At least 1 item is required.')
                      )
                    }
                  }
                }
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  <Collapse
                    size="middle"
                    className="items-collapse mt-4"
                    defaultActiveKey={'1'}
                    items={[
                      {
                        key: '1',
                        label: (
                          <Flex align="center">
                            <Typography.Title
                              level={4}
                              style={{ margin: 0, fontWeight: 'normal' }}
                            >
                              Family Members
                            </Typography.Title>
                            <Button
                              className="ml-auto"
                              type="primary"
                              onClick={(event) => {
                                event.stopPropagation()
                                add({})
                                setMemberNames([...memberNames, ''])
                              }}
                            >
                              <PlusOutlined />
                              Add member
                            </Button>
                          </Flex>
                        ),
                        children: (
                          <Collapse
                            size="middle"
                            className="items-collapse"
                            defaultActiveKey={0}
                            items={fields.map(
                              (
                                field: { key: any; name: any },
                                index: number
                              ) => ({
                                key: index,
                                label: (
                                  <Flex align="center">
                                    <Typography.Text
                                      style={{
                                        margin: 0,
                                        fontWeight: 'normal'
                                      }}
                                    >
                                      Member {index + 1}: {memberNames[index]}{' '}
                                      {index === 0 ? '(Primary Applicant)' : ''}
                                    </Typography.Text>
                                    {index !== 0 && (
                                      <Button
                                        className="ml-auto"
                                        type="primary"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          remove(index)
                                          const namesCopy = [...memberNames]
                                          namesCopy.splice(index, 1)
                                          setMemberNames(namesCopy)
                                        }}
                                      >
                                        <DeleteOutlined />
                                        Delete
                                      </Button>
                                    )}
                                  </Flex>
                                ),
                                children: (
                                  <Flex wrap gap={'12px'}>
                                    <Form.Item
                                      className="w-full sm:w-80 mb-0"
                                      label="Membership Number (if known)"
                                      name={[field.name, 'membershipNumber']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Name of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      className="w-full sm:w-80 mb-0"
                                      label="Full Name"
                                      name={[field.name, 'name']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Name of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <Input
                                        onChange={(e: any) => {
                                          const namesCopy = [...memberNames]
                                          namesCopy[index] = e.target.value
                                          setMemberNames(namesCopy)
                                        }}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      label="Gender"
                                      name={[field.name, 'gender']}
                                      className="w-full sm:w-80 mb-0"
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Gender of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <Select
                                        showSearch
                                        filterOption={(input, option) =>
                                          (
                                            option?.label
                                              ?.toString()
                                              .toLowerCase() ?? ''
                                          ).includes(
                                            input.toString().toLowerCase()
                                          )
                                        }
                                        options={[
                                          { value: 'male', label: 'Male' },
                                          { value: 'female', label: 'Female' }
                                        ]}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      className="w-full sm:w-80 mb-0"
                                      label="Date of Birth"
                                      name={[field.name, 'birthday']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Date of birth of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <DatePicker className="w-full sm:w-80" />
                                    </Form.Item>
                                    <Form.Item
                                      className="w-full sm:w-80 mb-0"
                                      label="Occupation"
                                      name={[field.name, 'occupation']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Occupation of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      className="w-full sm:w-80 mb-0"
                                      label="Education Background"
                                      name={[field.name, 'education']}
                                      rules={[
                                        {
                                          required: true,
                                          message:
                                            'Education background of the family member is required.'
                                        }
                                      ]}
                                    >
                                      <Input.TextArea autoSize />
                                    </Form.Item>
                                  </Flex>
                                )
                              })
                            )}
                          />
                        )
                      }
                    ]}
                  />
                </>
              )}
            </Form.List>
            <Collapse
              size="middle"
              className="items-collapse mt-4"
              defaultActiveKey={'1'}
              items={[
                {
                  key: '1',
                  label: (
                    <Typography.Title
                      level={4}
                      style={{ margin: 0, fontWeight: 'normal' }}
                    >
                      Financial Situation
                    </Typography.Title>
                  ),
                  children: (
                    <Flex wrap gap={'0px 12px'}>
                      <Form.Item
                        className="w-full sm:w-80 mb-0"
                        label="Monthly Income"
                        name="monthlyIncome"
                        rules={[
                          {
                            required: true,
                            message: 'Monthly income is required.'
                          }
                        ]}
                      >
                        <InputNumber
                          className="w-full sm:w-80"
                          addonBefore="USD"
                        />
                      </Form.Item>
                      <Form.Item
                        className="w-full sm:w-80 mb-0"
                        label="Monthly Expenses"
                        name="monthlyExpenses"
                        rules={[
                          {
                            required: true,
                            message: 'Monthly expenses is required.'
                          }
                        ]}
                      >
                        <InputNumber
                          className="w-full sm:w-80"
                          addonBefore="USD"
                        />
                      </Form.Item>
                    </Flex>
                  )
                }
              ]}
            />
          </Form>
          <div className="fixed bg-gray-200 bottom-0 left-0 right-0 border-0 border-t-4 border-solid border-t-[#707070] px-3 py-2">
            <Button size="large" type="primary" onClick={() => form.submit()}>
              Submit
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
