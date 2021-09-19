import React, { useState } from "react"
import { Link } from "gatsby"

const RecentContent = props => {
  const recentContentItems = [
    {
      title: "Building a Gatsby light / dark mode toggle",
      summary:
        "A tutorial / review of the process for building a toggle button for light and dark mode on this blog",
      link: "/code/theme-toggle",
    },
    {
      title: "My Post Title",
      summary:
        "A summary description of the post, that will give a little context to the work and ideally entice people to click the link",
    },
    {
      title: "Writing a simple but effective web crawler",
      summary:
        "Notes from writing a crawler, with the task to find and dead links in my blog.",
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
    console.log("HC", hover)
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
