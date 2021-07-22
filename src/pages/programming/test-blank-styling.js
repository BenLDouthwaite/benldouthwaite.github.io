import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"

const ReactIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  // TODO Get this to display as raw html, no (minimal) styling
  // IF I wanted to do 'demo projects' hosted at paths, how?
  return <h1>Test</h1>
}

export default ReactIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: "japanese" } } }
    ) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`
