import * as React from "react"
import { Col, Container, Row } from "react-bootstrap"

const ThemeTester = props => {
  return (
    <>
      <h3>Theme tester:</h3>
      <Container>
        <Row>
          <Col className="light-theme">
            <TestContent />
          </Col>
          <Col className="dark-theme">
            <TestContent />
          </Col>
        </Row>
      </Container>
    </>
  )
}

const TestContent = props => {
  return (
    <>
      <p>Some dark mode content</p>
      <table>
        <tr>
          <th>A</th>
          <th>B</th>
        </tr>
        <tr>
          <td>1</td>
          <td>2</td>
        </tr>
        <tr>
          <td>3</td>
          <td>4</td>
        </tr>
      </table>
    </>
  )
}

export default ThemeTester
