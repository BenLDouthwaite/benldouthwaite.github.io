import * as React from "react"
import { Col, Container, Row } from "react-bootstrap"

const ThemeTester = props => {
  return (
    <>
      <h3>Theme tester:</h3>
      <Container>
        <Row>
          <Col className="light-theme">
            <p>Some light mode content</p>
          </Col>
          <Col className="dark-theme">
            <p>Some dark mode content</p>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default ThemeTester
