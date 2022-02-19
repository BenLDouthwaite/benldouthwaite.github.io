import React from "react"
import Layout from "../../components/layout"
import { Col, Container, Row } from "react-bootstrap"
import { graphql } from "gatsby"

const ThemeTester = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  return (
    <>
      <Layout location={location} title={siteTitle}>
        <h3>Theme tester:</h3>
        <Container>
          <Row>
            <Col>
              <p>Default Theme</p>
              <TestContent />
            </Col>

            <Col className="dark-theme">
              <p>Dark Theme</p>
              <TestContent />
            </Col>
          </Row>
          <Row>
            <p>
              What steps did I take, to log before writing up fully later: - [x]
              Decide on the first pass color schemes for light / dark mode -
              Light: Plain white background with black text. Dark: Gray with
              blue hue, white / light gray text for fonts. - [x] Build out a
              demo page, that shows somes of the components and styling. - [ ]
              Can I make one that takes any 'children' as input, and renders a
              list of themes, either horizontally or vertically - [x] Can use
              gatsby 'hello-friend' as a reference - [x] Build a button on the
              nav bar, to toggle the applied themes. - [x] Apply global theme
              override for background and colours - [ ] Need to figure out
              syntax to be applied for each sub components. -> SASS - [ ]
              Possibly need to override the build to allow SASS for css
              pre-processing - [ ] On home page, fix on-hover colours and
              processing. - [ ] Fix table header highlighting - [ ] Review
              accent colours for the light / dark themes.
            </p>
          </Row>
        </Container>
      </Layout>
    </>
  )
}

const TestContent = props => {
  return (
    <>
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

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
