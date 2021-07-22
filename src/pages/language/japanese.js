import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"

const JapaneseIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  console.log(posts)

  return (
    <Layout location={location} title={siteTitle}>
      <h1>Japanese</h1>
      <p>
        Want to add query to link out to sub pages below. Below examples use
        tags with GraphQL
      </p>
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug

          return (
            <li key={post.fields.slug}>
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  {false && <small>{post.frontmatter.date}</small>}
                </header>
              </article>
            </li>
          )
        })}
      </ol>

      <p>
        How to do using slug prefix / regex? Seems to be the wrong design. I
        want a hierarchical layout, if easy
      </p>
    </Layout>
  )
}

export default JapaneseIndex

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
