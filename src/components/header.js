import React, { useState } from "react"
import { Link } from "gatsby"

import { Nav, Navbar, Button } from "react-bootstrap"
import { Helmet } from "react-helmet"
import { BsSun, BsFillMoonFill } from "react-icons/bs"

const Header = props => {
  const { header, defaultTheme } = props

  const defaultThemeState =
    (typeof window !== "undefined" && window.localStorage.getItem("theme")) ||
    null
  const [userTheme, changeTheme] = useState(defaultThemeState)
  const [isMobileMenuVisible, toggleMobileMenu] = useState(false)
  const [isSubMenuVisible, toggleSubMenu] = useState(false)

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
          <Nav className="me-auto">
            <Link to={`/`} style={{ textDecoration: "none" }}>
              {header}
            </Link>
          </Nav>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="me-auto" className="justify-content-end">
              <Link to={`/blog`} style={{ textDecoration: "none" }}>
                Blog
              </Link>
              <Link to={`/projects`} style={{ textDecoration: "none" }}>
                Projects
              </Link>
              <Link to={`/tools`} style={{ textDecoration: "none" }}>
                Tools
              </Link>
              <Link
                to={`/notes`}
                style={{ textDecoration: "none" }}
                activeStyle={{ color: "red" }}
              >
                Notes
              </Link>
              <button
                onClick={handleClick}
                style={{
                  cursor: "pointer",
                  "background-color": "transparent",
                  "background-repeat": "no-repeat",
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
