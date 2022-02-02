import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const ToolsIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const markdownPosts = data.allMarkdownRemark.nodes

  const mdxPosts = data.allMdx.nodes

  if (markdownPosts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Seo title="All posts" />
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <h2>Tools</h2>
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
