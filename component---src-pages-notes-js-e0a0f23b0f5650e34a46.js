(self.webpackChunkbendouthwaite_com=self.webpackChunkbendouthwaite_com||[]).push([[757],{9535:function(e,t,n){"use strict";var l=n(7294),r=n(5444);t.Z=function(){var e,t=null===(e=(0,r.useStaticQuery)("3257411868").site.siteMetadata)||void 0===e?void 0:e.author;return l.createElement("div",{className:"bio"},(null==t?void 0:t.name)&&l.createElement("p",null,"Written by ",l.createElement("strong",null,t.name)))}},6179:function(e,t,n){"use strict";var l=n(7294),r=n(5414),a=n(5444),i=function(e){var t,n,i,o=e.description,c=e.lang,s=e.meta,m=e.title,u=(0,a.useStaticQuery)("2841359383").site,d=o||u.siteMetadata.description,p=null===(t=u.siteMetadata)||void 0===t?void 0:t.title;return l.createElement(r.q,{htmlAttributes:{lang:c},title:m,titleTemplate:p?"%s | "+p:null,meta:[{name:"description",content:d},{property:"og:title",content:m},{property:"og:description",content:d},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"twitter:creator",content:(null===(n=u.siteMetadata)||void 0===n||null===(i=n.social)||void 0===i?void 0:i.twitter)||""},{name:"twitter:title",content:m},{name:"twitter:description",content:d}].concat(s)})};i.defaultProps={lang:"en",meta:[],description:""},t.Z=i},8568:function(e,t,n){"use strict";n.r(t);var l=n(7294),r=n(5444),a=n(9535),i=n(5127),o=n(6179);t.default=function(e){var t,n=e.data,c=e.location,s=(null===(t=n.site.siteMetadata)||void 0===t?void 0:t.title)||"Title",m=n.allMarkdownRemark.nodes,u=n.allMdx.nodes;return 0===m.length?l.createElement(i.Z,{location:c,title:s},l.createElement(o.Z,{title:"All posts"}),l.createElement(a.Z,null),l.createElement("p",null,'No blog posts found. Add markdown posts to "content/blog" (or the directory you specified for the "gatsby-source-filesystem" plugin in gatsby-config.js).')):l.createElement(i.Z,{location:c,title:s},l.createElement(o.Z,{title:"All posts"}),l.createElement("ol",{style:{listStyle:"none"}},u.map((function(e){var t=e.frontmatter.title||e.slug;return l.createElement("li",{key:e.slug},l.createElement("article",{className:"post-list-item",itemScope:!0,itemType:"http://schema.org/Article"},l.createElement("header",null,l.createElement("h2",null,l.createElement(r.Link,{to:"/"+e.slug,itemProp:"url"},l.createElement("span",{itemProp:"headline"},t))),l.createElement("small",null,e.frontmatter.date)),l.createElement("section",null,l.createElement("p",{dangerouslySetInnerHTML:{__html:e.frontmatter.description||e.excerpt},itemProp:"description"}))))})),m.map((function(e){var t=e.frontmatter.title||e.fields.slug;return l.createElement("li",{key:e.fields.slug},l.createElement("article",{className:"post-list-item",itemScope:!0,itemType:"http://schema.org/Article"},l.createElement("header",null,l.createElement("h2",null,l.createElement(r.Link,{to:e.fields.slug,itemProp:"url"},l.createElement("span",{itemProp:"headline"},t))),l.createElement("small",null,e.frontmatter.date)),l.createElement("section",null,l.createElement("p",{dangerouslySetInnerHTML:{__html:e.frontmatter.description||e.excerpt},itemProp:"description"}))))}))))}}}]);
//# sourceMappingURL=component---src-pages-notes-js-e0a0f23b0f5650e34a46.js.map