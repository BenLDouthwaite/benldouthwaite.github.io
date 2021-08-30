import { Button } from "bootstrap";
import { Link } from "gatsby";
import * as React from "react"
import { Card, Col, Container, Row } from "react-bootstrap";
import TestCard from "../../components/test-card";

const Home = () => {

  console.log('Home - Load');

  return (
    <>
      <h1>Home Page. Hello</h1>
      <Container>
        <Row>
          {/* Projects to be added once I can link through to some */}
          {/* <Col>
            <h2>Projects</h2>
          </Col> */}
          <Col>
            <h2><Link to="/notes">Notes</Link></h2>
          </Col>
          <Col>
            <h2>Blog</h2>
          </Col>
        </Row>
      </Container>
      
      <TestCard />
      
      <h2>Blog</h2>
      <h3>Twitter Link</h3>
      <h3>Github Link</h3>
      <h3>LinkedIn Link</h3>
    </>
  )
}

export default Home

