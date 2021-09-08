import * as React from "react"
import { Card } from "react-bootstrap";

const TestCard = () => {

  return (
    <Card style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>My Card Title</Card.Title>
          <Card.Text>
            My Card Content
          </Card.Text>
        </Card.Body>
      </Card>
  )
}

export default TestCard

