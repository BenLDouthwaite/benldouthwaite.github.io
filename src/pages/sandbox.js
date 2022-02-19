import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import CanvasPage from "./sandbox/CanvasPage"

const SandboxIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} title={siteTitle}>
      <h1>Sandbox</h1>
      <CanvasPage />
    </Layout>
  )
}

export default SandboxIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
