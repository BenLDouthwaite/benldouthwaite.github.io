---
title: Gatsby
date: "2021-07-22T23:00:00.000Z"
description: ""
---

## Notes:

GraphQl

TODO Why are quotes rendered so big? Clear the CSS
> To pull data into a “building block” component, use the useStaticQuery hook.
> To pull data into a page component, use a page query.

- `gatsby-config.js`
  - Contains `siteMetadata`.
    - Pulled into data layer automatically.
  - Configures `gatsby-source-filesystem`
    - Add files to the data layer

- GraphiQL
  - 'Explorer' shows fields available in the data layer.
  - Purple with `:` = argument
  - Blue = selected field
  - Use `allFile` to get data on many files at once
    - `allFile { nodes { name }}` Get all file names

## Outstanding Questions

- [ ] Where is 'location' piped in from in pages?
- [ ] What is `gatsby-browser.js`?
- [ ] What is `gatsby-config.js`?
- [ ] What is `gatsby-node.js`?
- [ ] How to have standalone unstyled pages?
  - layout being applied on test page,
    - `background-color: var(--dark-background);` being applied from body
- [ ] How to 'customise the schema'
  - Want to allow prefix searching
    - https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/

## Development notes

- Having a `:` in the page title breaks frontmatter, probably for all fields
