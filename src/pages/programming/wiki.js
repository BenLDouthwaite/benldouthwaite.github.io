import * as React from "react"

import Layout from "../../components/layout"

const ReactIndex = ({ location }) => {
  return (
    <>
      <Layout location={location}>
        <h1>Wiki</h1>
      </Layout>
    </>
  )
}

export default ReactIndex

// Don't need the graphQl query if unused
