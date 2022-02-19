import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"

import Layout from "../../components/layout"
import MapChart from "../../components/MapChart"
import { Col, Container, Row, ToggleButton } from "react-bootstrap"

import geographyObject from "../../data/mapData.json" // = 241 countries
// import geographyObject from "../../data/mapDataDetailed.json" // = 255 countries

import ReactTooltip from "react-tooltip"

// TODO These are quite brittle, need to match source data exactly.
// Possibly better to use ISO code, then language agnostic
const alternativeCountryNames = {
  uk: "United Kingdom",
  usa: "United States of America",
}

const initCountryData = () => {
  console.log("init country data. Should be called only once")

  // 10 or 50 = scaling of the map
  // todo how to process these automatically when updating source?

  // const countries = geographyObject.objects.ne_10m_admin_0_countries.geometries
  const countries = geographyObject.objects.ne_50m_admin_0_countries.geometries

  const countryData = countries
    .map(ctr => ctr.properties)
    .reduce((obj, item) => {
      return {
        ...obj,
        [item.NAME]: {
          ...item,
          guessed: false,
        },
      }
    }, {})

  return countryData
}

const matchingGuessKey = (originalGuess, countryData, validGuessMap) => {
  let guess = originalGuess.toLowerCase()
  if (guess in validGuessMap) {
    const key = validGuessMap[guess]

    if (countryData[key].guessed) {
      return null
    }

    console.log("RETURN KEY", key)
    return key
  }

  return null
}

const WorldMapQuiz = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  const [guess, setGuess] = useState("")
  const [countryData, setCountryData] = useState(() => initCountryData())
  const [content, setContent] = useState("")
  const [showDebug, setShowDebug] = useState(false)

  // All keys lowercased.
  const [validGuessMap, setValidGuessMap] = useState(null)

  console.log("OH SHIT, HERE WE GO AGAIN", countryData)

  // Data Initialiser -> `initCountryData` will have alredy run before first render
  useEffect(() => {
    const countries =
      geographyObject.objects.ne_50m_admin_0_countries.geometries

    // Ensure all keys are lowercase for alternatives
    let lcKeyAlternativeCountryNames = Object.keys(
      alternativeCountryNames
    ).reduce((acc, key) => {
      acc[key.toLowerCase()] = alternativeCountryNames[key]
      return acc
    }, {})

    // Pull all keys as valid answers from Country Data
    // TODO Do we also want "long names"?
    let validGuessMap = Object.keys(countryData).reduce((obj, item) => {
      return {
        ...obj,
        [item.toLowerCase()]: item,
      }
    }, lcKeyAlternativeCountryNames)

    console.log("Set Country Data Now, after init. Please", countryData)
    setCountryData(countryData)

    console.log("And now set valid guess map")
    setValidGuessMap(validGuessMap)

    // initialiseData(setCountryData, setValidGuessMap)
  }, [])

  useEffect(() => {
    console.log("Country Data Changed", countryData)
  }, [countryData])

  useEffect(() => {
    console.log("Guess updated", guess, countryData)

    let ctr = { ...countryData }

    // Set matching found
    // TODO Where is the best place for this method?
    if (guess != "") {
      let key = matchingGuessKey(guess, countryData, validGuessMap)
      if (key !== null) {
        ctr[key].guessed = true
        setGuess("")
      }
    }

    // Null on first render, before creation.
    if (validGuessMap !== null) {
      // Check highlighting for any given guess (including empty)

      // How to handle this better? Issue with many names, can be set to highlight, then cleared.
      // If not yet set, check again. If already set this iteration, skip it.
      let highlightedCountries = new Map()
      Object.keys(validGuessMap).forEach(validGuess => {
        let countryName = validGuessMap[validGuess]

        if (highlightedCountries.get(countryName) === true) {
          return
        }

        if (guess != "" && validGuess.startsWith(guess.toLowerCase())) {
          ctr[countryName].highlight = true
          highlightedCountries.set(countryName, true)
        } else {
          ctr[countryName].highlight = false
        }
      })
    }

    setCountryData(ctr)
  }, [guess])

  const correctGuesses = countryData
    ? Object.values(countryData).filter(ctr => ctr.guessed).length
    : 0

  const debugStyles = {
    border: "5px solid rgba(255, 0, 0, 0.5)",
    // width: "2000px",
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
                onChange={e => setGuess(e.target.value)}
              />
            </div>
            {countryData && (
              <p>
                Guessed : {correctGuesses} / {Object.keys(countryData).length}
              </p>
            )}

            <ToggleButton
              id="toggle-check"
              type="checkbox"
              variant="secondary"
              checked={showDebug}
              value="1"
              onChange={e => setShowDebug(e.currentTarget.checked)}
            >
              show debug
            </ToggleButton>
            <div style={debugStyles}>
              <MapChart
                geographies={geographyObject}
                countryData={countryData}
                setTooltipContent={setContent}
              />
              <ReactTooltip>{content}</ReactTooltip>
            </div>
          </Col>
          {showDebug && (
            <Col xs={1}>
              DEBUG : Object.values?
              <ul>
                {Object.values(countryData)
                  .filter(ctr => !ctr.guessed)
                  .map(ctr => {
                    return <p key={ctr.NAME}>{ctr.NAME}</p>
                  })}
              </ul>
            </Col>
          )}
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
