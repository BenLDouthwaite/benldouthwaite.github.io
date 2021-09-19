import * as React from "react"
import { Link } from "gatsby"

const FeaturedContent = props => {
  // TODO This can be sourced as a GraphQL query from frontmatter, somwhow
  const featuredContentItems = [
    {
      title: "Microservice Design Patterns",
      link: "/notes",
    },
    {
      title: "Java Memory Model",
      link: "/notes",
    },
    {
      title: "Getting started with Kafka",
      link: "/notes",
    },
    {
      title: "Japanese Verb conjugation",
      link: "/notes",
    },
    {
      title: "An introduction to Blockchain",
      link: "/notes",
    },
  ]

  return (
    <>
      <h3>Featured content</h3>
      {featuredContentItems.map(item => {
        return (
          <li>
            <FeaturedContentItem item={item} />
          </li>
        )
      })}
    </>
  )
}

const FeaturedContentItem = props => {
  return (
    <Link
      to={`${props.item.link}`}
      itemProp="url"
      style={{ textDecoration: "none" }}
    >
      <span itemProp="headline">{props.item.title}</span>
    </Link>
  )
}

export default FeaturedContent
