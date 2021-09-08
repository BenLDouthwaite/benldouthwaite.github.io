import * as React from "react"
import { Link } from "gatsby"
import { AiFillTwitterCircle } from "@react-icons/all-files/ai/AiFillTwitterCircle";

import Header from "./header"

import "../styles/layout.css"

const Layout = ({ location, title, children }) => {

  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header
  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <Header header={header} />
      <main>{children}</main>


      
      <footer>© All rights reserved | {new Date().getFullYear()} | <a href="https://twitter.com/BenLDouthwaite"><AiFillTwitterCircle /></a></footer>
    </div>
  )
}

export default Layout
