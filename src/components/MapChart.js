import React from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup,
} from "react-simple-maps"

const MapChart = ({ geographies, countryData, setTooltipContent }) => {
  return (
    <ComposableMap
      data-tip=""
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147,
      }}
    >
      <ZoomableGroup zoom={1}>
        {/* <Sphere stroke="#E4E5E6" strokeWidth={0.5} /> */}
        <Sphere stroke="#FF0000" strokeWidth={0.5} />
        {/* <Graticule stroke="#E4E5E6" strokeWidth={0.5} /> */}
        <Graticule stroke="#00FF00" strokeWidth={0.1} />
        {/* <Geographies geography={geoUrl}> */}
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map(geo => {
              let fillColour = "#F5F4F6"

              if (geo.properties.NAME !== undefined) {
                let countryName = geo.properties.NAME
                if (countryData[countryName] !== undefined) {
                  let country = countryData[countryName]

                  // If guessed, set cleared
                  if (country.guessed) {
                    fillColour = "#FF0000"
                  }

                  // If matching current guess (and easy mode selected, to be added as a switch)
                  else if (country.highlight) {
                    fillColour = "#00FF00"
                  }
                }
              }

              return (
                <Geography
                  onMouseEnter={() => {
                    const { NAME } = geo.properties
                    if (NAME in countryData && countryData[NAME].guessed) {
                      setTooltipContent(`${NAME}`)
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("")
                  }}
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColour}
                  stroke="black"
                  strokeWidth={0.1}
                />
              )
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  )
}

export default MapChart
