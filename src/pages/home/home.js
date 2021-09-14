import * as React from "react"
import { Card, Col, Container, Row } from "react-bootstrap"
import FeaturedContent from "../../components/featured-content"

const Home = () => {
  return (
    <Container>
      <Row>
        <Col sm="8">
          <h3>Recently Published</h3>
          <h4>My Post Title</h4>
          <p>
            A summary description of the post, that will give a little context
            to the work and ideally entice people to click the link
          </p>
          <h4>Writing a simple but effective web crawler</h4>
          <p>
            Notes from writing a crawler, with the task to find and dead links
            in my blog.
          </p>
          <h4>Building a Gatsby light / dark mode toggle</h4>
          <p>
            A tutorial / review of the process for building a toggle button for
            light and dark mode on this blog
          </p>
        </Col>
        <Col sm="4">
          <FeaturedContent />
        </Col>
      </Row>
    </Container>
  )
}

export default Home
