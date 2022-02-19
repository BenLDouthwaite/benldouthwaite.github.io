import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"

import Layout from "../../components/layout"
import MapChart from "../../components/MapChart"
import { Col, Container, Row } from "react-bootstrap"

import geographyObject from "../../data/mapData.json" // = 241 countries
// import geographyObject from "../../data/mapDataDetailed.json" // = 255 countries

import ReactTooltip from "react-tooltip"

const alternativeCountryNames = {
  uk: "United Kingdom",
  frn: "France",
}
const initCountryData = () => {
  // 10 or 50 = scaling of the map
  // todo how to process these automatically when updating source?
  // const countries = geographyObject.objects.ne_10m_admin_0_countries.geometries
  const countries = geographyObject.objects.ne_50m_admin_0_countries.geometries

  const countriesArray = countries.map(ctr => ctr.properties)

  const countryData = countriesArray.reduce((obj, item) => {
    return {
      ...obj,
      [item.NAME]: {
        ...item,
        guessed: false,
      },
    }
  }, {})

  console.log("Country Data", countryData)

  // console.log("Generate valid guess map")

  // let validGuessMap = countriesArray.reduce((obj, item) => {
  //   return {
  //     ...obj,
  //     [item.NAME]: item.NAME,
  //   }
  // }, alternativeCountryNames)

  // // TODO use valid guess on itput to check if exists in the keyset.
  // console.log("Valid guess map ", validGuessMap)

  return countryData
}

// TODO Can I pre-calculate a map of all valid guesses, to their "correct" country NAME
const matchingGuessKey = (originalGuess, countryData, validGuessMap) => {
  console.log("OG, VGM", originalGuess, validGuessMap)

  let guess = originalGuess.toLowerCase()

  if (guess in validGuessMap) {
    const key = validGuessMap[guess]
    console.log("RETURN KEY", key)
    return key
  }

  return null

  // console.log("VGM", validGuessMap)

  // let guess = originalGuess.toLowerCase()

  // let unguessedCountries = Object.values(countryData).filter(
  //   ctr => !ctr.guessed
  // )

  // let matchingCountry = unguessedCountries.find(ctr => {
  //   // TODO Add all matching rules.
  //   let lcname = ctr.NAME.toLowerCase()
  //   console.log(`COMPARE: ${lcname} and ${guess}`)
  //   return lcname === guess
  // })

  // if (matchingCountry !== undefined) {
  //   return matchingCountry.NAME
  // }

  // return null

  // return guess in countryData && !countryData[guess].guessed
}

const WorldMapQuiz = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  const [guess, setGuess] = useState("")
  const [countryData, setCountryData] = useState(() => initCountryData())
  const [content, setContent] = useState("")

  // All keys lowercased.
  const [validGuessMap, setValidGuessMap] = useState(null)

  useEffect(() => {
    console.log("USE EFFECT CALLED")
    console.log("Generate valid guess map")

    let countriesArray = Object.keys(countryData)

    console.log("COuntries Array", countriesArray)

    // Ensure all keys are lowercase for alternatives
    let lcKeyAlternativeCountryNames = Object.keys(
      alternativeCountryNames
    ).reduce((acc, key) => {
      acc[key.toLowerCase()] = alternativeCountryNames[key]
      return acc
    }, {})

    let validGuessMap = countriesArray.reduce((obj, item) => {
      return {
        ...obj,
        [item.toLowerCase()]: item,
      }
    }, lcKeyAlternativeCountryNames)

    // TODO use valid guess on itput to check if exists in the keyset.
    console.log("Valid guess map ", validGuessMap)

    setValidGuessMap(validGuessMap)
  }, [countryData])

  // TODO Where should this method sit?
  const submitGuess = guess => {
    let key = matchingGuessKey(guess, countryData, validGuessMap)
    if (key !== null) {
      let ctr = { ...countryData }

      ctr[key] = {
        ...ctr[key],
        guessed: true,
      }

      setCountryData(ctr)
      setGuess("")
    }
  }

  const correctGuesses = Object.values(countryData).filter(ctr => ctr.guessed)
    .length

  const debugStyles = {
    border: "5px solid rgba(255, 0, 0, 0.5)",
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Container>
        <Row>
          <Col>
            <p>World Map Quiz</p>
            <div className="form-group">
              <label>Enter Country or Territory Name: </label>
              <input
                type="text"
                value={guess}
                onChange={e => {
                  // TODO Can i combine?
                  setGuess(e.target.value)
                  submitGuess(e.target.value)
                }}
              />
            </div>
            <p>
              Guessed : {correctGuesses} / {Object.keys(countryData).length}
            </p>
            <div style={debugStyles}>
              <MapChart
                geographies={geographyObject}
                countryData={countryData}
                setTooltipContent={setContent}
              />
              <ReactTooltip>{content}</ReactTooltip>
            </div>
          </Col>
          <Col xs={1}>
            DEBUG : Object.values?
            <ul>
              {Object.values(countryData)
                .filter(ctr => !ctr.guessed)
                .map(ctr => {
                  return <p key={ctr.name}>{ctr.name}</p>
                })}
            </ul>
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export default WorldMapQuiz

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
