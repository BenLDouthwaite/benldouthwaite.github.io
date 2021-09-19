import * as React from "react"
import { Col, Container, Row } from "react-bootstrap"
import FeaturedContent from "../../components/featured-content"
import RecentContent from "../../components/recent-content"

const Home = () => {
  return (
    <Container>
      <Row>
        <Col sm="8">
          <RecentContent />
        </Col>
        <Col sm="4">
          <FeaturedContent />
        </Col>
      </Row>
    </Container>
  )
}

export default Home
