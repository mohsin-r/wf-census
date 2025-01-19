import React from 'react'
import { Outlet } from 'react-router-dom'
import logo from 'assets/logo.png'
import { Typography } from 'antd'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-0 border-b-4 border-solid border-b-[#707070] px-3 py-2">
        <img src={logo} className="h-8"></img>
        <Typography.Title
          className="hidden sm:block"
          level={3}
          style={{ margin: 0 }}
        >
          Census Data System
        </Typography.Title>
        <div></div>
      </div>
      <main className="relative grow px-3">
        <Outlet />
      </main>
    </div>
  )
}
