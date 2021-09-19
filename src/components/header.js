import React, { useState } from "react"
import { Link } from "gatsby"

import { Nav, Navbar, Button } from "react-bootstrap"
import { Helmet } from "react-helmet"

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
        <Navbar variant="dark" expand="sm">
          {/* TODO This is causing error in the console relating to nested a tags */}
          {/* <Navbar.Brand href="/">
            <div className="global-header">{header}</div>
          </Navbar.Brand> */}

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
              <Button onClick={handleClick} />
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </header>
    </>
  )
}

export default Header
