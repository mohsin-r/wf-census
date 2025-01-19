/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom'
import { Table, Space, Typography, Popconfirm, Button } from 'antd'
import type { TableProps } from 'antd'
import { useEffect, useState } from 'react'
import { compareString, getCookie, host } from 'utils'
import { PlusOutlined } from '@ant-design/icons'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Dashboard() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const columns: TableProps['columns'] = [
    {
      title: 'Federation',
      dataIndex: 'federation',
      key: 'federation',
      width: '20%',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        compareString(a.federation.toLowerCase(), b.federation.toLowerCase())
    },
    {
      title: 'Jamaat',
      dataIndex: 'jamaat',
      key: 'jamaat',
      width: '20%',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorter: (a: any, b: any) =>
        compareString(a.jamaat.toLowerCase(), b.jamaat.toLowerCase())
    },
    {
      title: 'Family Members',
      key: 'members',
      width: '20%',
      render: (_, record) => (
        <div>
          {record.members.map((member: any) => (
            <div key={member.name}>{member.name}</div>
          ))}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Typography.Link
            disabled={deleting}
            onClick={() => {
              navigate(`/edit/${record.id}`)
            }}
          >
            Edit
          </Typography.Link>
          <Popconfirm
            title="Are you sure you want to remove the entry?"
            onConfirm={() => remove(record.id)}
            disabled={deleting}
          >
            <Typography.Link type="danger" disabled={deleting}>
              Delete
            </Typography.Link>
          </Popconfirm>
        </Space>
      )
    }
  ]

  useEffect(() => {
    setLoading(true)
    fetch(`${host}/records`, {
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
          setRecords(json)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [])

  const remove = async (id: string) => {
    const index = records.findIndex((r: any) => r.id === id)
    if (index !== -1) {
      const copy = [...records]
      copy.splice(index, 1)
      setRecords(copy)
      setDeleting(true)
      await fetch(`${host}/record/${id}`, {
        method: 'delete',
        // @ts-expect-error bad TS
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCookie('csrf_access_token')
        },
        credentials: 'include'
      })
      setDeleting(false)
    }
  }
  return (
    <div className="mt-4">
      <div className="flex items-center">
        <h2 className="m-0">World Federation Member Records</h2>
        <Button
          className="ml-auto"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/register')}
        >
          Register new member
        </Button>
      </div>
      <Table
        bordered
        className="mt-4"
        columns={columns}
        dataSource={records}
        loading={loading}
        pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
        scroll={{
          x: true,
          y: 500
        }}
      />
    </div>
  )
}
