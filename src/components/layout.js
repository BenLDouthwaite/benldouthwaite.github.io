import * as React from "react"
import { Link } from "gatsby"

import {
  AiFillTwitterCircle,
  AiFillGithub,
  AiFillLinkedin,
} from "react-icons/ai"
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
      <Header header={header} defaultTheme="dark" />
      <main>{children}</main>

      <footer>
        © All rights reserved | {new Date().getFullYear()} |{" "}
        <a href="https://twitter.com/BenLDouthwaite">
          <AiFillTwitterCircle />
        </a>
        <a href="https://github.com/BenLDouthwaite">
          <AiFillGithub />
        </a>
        <a href="https://www.linkedin.com/in/ben-douthwaite/">
          <AiFillLinkedin />
        </a>
      </footer>
    </div>
  )
}

export default Layout
