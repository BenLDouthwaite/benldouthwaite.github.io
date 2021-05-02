import * as React from "react"
import { graphql } from "gatsby"

import Layout from "../../components/layout"

const PageTemplate = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} title={siteTitle}>
      <p>New Page Template</p>
    </Layout>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
