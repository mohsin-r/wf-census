import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { ConfigProvider, Flex } from 'antd'
import Layout from 'components/Layout'
import logo from 'assets/logo.png'

import Dashboard from 'components/Dashboard'
import DataForm from 'components/Form'
import NotFound from 'components/NotFound'
import 'styles.css'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'

function App() {
  useEffect(() => {
    if (import.meta.env.VITE_DOWN === 'false') {
      dayjs.extend(customParseFormat)
      dayjs.extend(advancedFormat)
      dayjs.extend(weekday)
      dayjs.extend(localeData)
      dayjs.extend(weekOfYear)
      dayjs.extend(weekYear)
    }
  }, [])
  if (import.meta.env.VITE_DOWN === 'true') {
    return (
      <Flex
        gap="small"
        className="h-screen w-screen text-[#3b7273]"
        vertical
        align="center"
        justify="center"
      >
        <img src={logo} className="h-20"></img>
        <h1 className="m-0 p-0">Census Data System</h1>
        <h2 className="m-0 p-0">
          System is down for implementing improvements.
        </h2>
        <h3 className="m-0 p-0">Please check back later.</h3>
      </Flex>
    )
  }
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: '#707070',
          colorLink: '#707070',
          colorBorder: '#707070',
          colorBorderSecondary: '#707070',
          colorBgContainerDisabled: '#707070',
          colorTextDisabled: '#707070',
          fontSize: 16
        },
        components: {
          Menu: {
            iconSize: 18
          },
          Form: {
            labelHeight: 0,
            verticalLabelPadding: 0
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="" element={<Dashboard />} />
            <Route path="/register" element={<DataForm mode="new" />} />
            <Route path="/edit/:id" element={<DataForm mode="edit" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
