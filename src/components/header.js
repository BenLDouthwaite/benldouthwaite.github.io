import React, { useState } from "react"
import { Link } from "gatsby"

import { Nav, Navbar } from "react-bootstrap"
import { Helmet } from "react-helmet"
import { BsSun, BsFillMoonFill } from "react-icons/bs"

const Header = props => {
  const { header, defaultTheme } = props

  const defaultThemeState =
    (typeof window !== "undefined" && window.localStorage.getItem("theme")) ||
    null
  const [userTheme, changeTheme] = useState(defaultThemeState)

  const onChangeTheme = () => {
    const opositeTheme =
      (userTheme || defaultTheme) === "light" ? "dark" : "light"

    changeTheme(opositeTheme)

    typeof window !== "undefined" &&
      window.localStorage.setItem("theme", opositeTheme)
  }

  const handleClick = () => {
    onChangeTheme()
  }

  return (
    <>
      <Helmet>
        <body
          className={
            (userTheme || defaultTheme) === "light"
              ? "light-theme"
              : "dark-theme"
          }
        />
      </Helmet>
      <header>
        <Navbar expand="sm">
          <Nav className="me-auto">{header}</Nav>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="me-auto, justify-content-end">
              <Link to={`/blog`} style={{ textDecoration: "none" }}>
                Blog
              </Link>
              <Link to={`/tools`} style={{ textDecoration: "none" }}>
                Tools
              </Link>
              <Link to={`/sandbox`} style={{ textDecoration: "none" }}>
                Sandbox
              </Link>
              <button
                onClick={handleClick}
                style={{
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  backgroundRepeat: "no-repeat",
                  border: "none",
                  overflow: "hidden",
                  outline: "none",
                  margin: "5px",
                  padding: "0px 15px 0px",
                }}
              >
                {userTheme === "light" && <BsSun />}
                {userTheme !== "light" && <BsFillMoonFill />}
              </button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </header>
    </>
  )
}

export default Header
