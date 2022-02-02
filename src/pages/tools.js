import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const ToolsIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} title={siteTitle}>
      <h1>Tools</h1>
      <ul>
        <li>
          <Link
            to={`/tools/calculator`}
            itemProp="url"
            style={{ textDecoration: "none" }}
          >
            Compound Interest Calculator
          </Link>
        </li>
      </ul>
    </Layout>
  )
}

export default ToolsIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
