import React from "react"
import { graphql } from "gatsby"
// import { MDXProvider } from "@mdx-js/react"
import { MDXRenderer } from "gatsby-plugin-mdx"
import Layout from "../components/layout"
// import components from "./mdxComponents"
import Seo from "../components/seo"

export default function PageTemplate({ data, location }) {
  const mdx = data.mdx
  const siteTitle = data.site.siteMetadata?.title || `Title`

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={mdx.frontmatter.title} />
      <header>
        <h1 itemProp="headline">{mdx.frontmatter.title}</h1>
      </header>
      <div style={{ padding: "0 1rem", marginBottom: "10rem" }}>
        {/* <MDXProvider components={components}> */}
        <MDXRenderer>{mdx.body}</MDXRenderer>
        {/* </MDXProvider> */}
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    site {
      siteMetadata {
        title
      }
    }
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
    }
  }
`
