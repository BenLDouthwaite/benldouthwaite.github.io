import React from "react"
import { Link } from "gatsby"

import { Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap"
import { Helmet } from "react-helmet"

const Header = props => {
  const { header } = props

  return (
    <>
      <Helmet>
        <body />
      </Helmet>
      <header>
        <Navbar variant="dark" expand="sm">
          <Navbar.Brand href="/">
            <div className="global-header">{header}</div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="me-auto" className="justify-content-end">
              {/* <Nav.Link> */}
              <Link to={`/blog`} style={{ textDecoration: "none" }}>
                Blog
              </Link>
              {/* </Nav.Link> */}

              {/* <Nav.Link> */}
              <Link to={`/projects`} style={{ textDecoration: "none" }}>
                Projects
              </Link>
              {/* </Nav.Link> */}

              {/* <Nav.Link> */}
              <Link to={`/tools`} style={{ textDecoration: "none" }}>
                Tools
              </Link>
              {/* </Nav.Link> */}

              {/* <Nav.Link> */}
              <Link to={`/notes`} style={{ textDecoration: "none" }}>
                Notes
              </Link>
              {/* </Nav.Link> */}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </header>
    </>
  )
}

export default Header
