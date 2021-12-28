import React, { useState } from "react"
import { Link } from "gatsby"

const RecentContent = props => {
  const recentContentItems = [
    {
      title: "GraphQL query for content sorted by date",
      summary:
        "TODO Update this component to return content sorted by date, as per /notes",
      link: "/notes",
    },
  ]

  return (
    <>
      <h3>Recent content</h3>
      {recentContentItems.map(item => {
        return <RecentContentItem item={item} />
      })}
    </>
  )
}

const RecentContentItem = props => {
  // TODO add a 'read more' link?
  const [hover, setHover] = useState(false)

  const toggleHover = hover => {
    setHover(hover)
  }

  var headingStyle
  var linkStyle
  if (hover) {
    headingStyle = { color: "2d8efd" }
    linkStyle = { color: "#cccccc" }
  } else {
    headingStyle = {}
    linkStyle = {}
  }

  return (
    <Link
      to={`${props.item.link}`}
      itemProp="url"
      style={{ textDecoration: "none" }}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
    >
      <h4 style={headingStyle}>{props.item.title}</h4>
      <p style={linkStyle}>{props.item.summary}</p>
    </Link>
  )
}

export default RecentContent
