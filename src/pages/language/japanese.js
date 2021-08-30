import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"

const JapaneseIndex = ({ data, location }) => {

  console.log('Japanese index page data', data)

//  const siteTitle = data.site.siteMetadata?.title || `Title`
//  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout location={location}>
      <h1>Japanese</h1>
      <p>
        Want to add query to link out to sub pages below. Below examples use
        tags with GraphQL
      </p>
      <p>
        How to do using slug prefix / regex? Seems to be the wrong design. I
        want a hierarchical layout, if easy
      </p>
    </Layout>
  )
}

export default JapaneseIndex

// Maybe I don't need 'startsWith', but instead can chain them. Get all directories, and use that for an 'in'

// TODO How to get 'startsWith' instead of 'eq' to get all files together.
export const pageQuery = graphql`
  query {
      site {
        siteMetadata {
          title
        }
      }
      allFile(filter: {relativeDirectory: {eq: "language/japanese"}}) {
        nodes {
          name
          relativeDirectory
          relativePath
        }
      }
    }
`
