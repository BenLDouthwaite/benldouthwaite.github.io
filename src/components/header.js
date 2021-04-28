import React from "react"
import { Helmet } from "react-helmet"

const Header = props => {
  const { header } = props

  return (
    <>
      <Helmet>
        <body />
      </Helmet>
      <header>
        <div className="global-header">{header}</div>
      </header>
    </>
  )
}

export default Header
