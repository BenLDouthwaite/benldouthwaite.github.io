import React, { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { Col, Container, Row } from "react-bootstrap"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { graphql } from "gatsby"

const Calculator = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`

  const [initialBalance, setInitialBalance] = useState("1000")
  const [interestRate, setInterestRate] = useState("5")
  const [years, setYears] = useState("40")
  const [total, setTotal] = useState("")

  const [values, setValues] = useState()

  useEffect(() => {
    let rate = 1 + interestRate / 100
    let total = initialBalance * rate ** years
    setTotal(total)

    let values = []

    let currentBalance = initialBalance
    for (let i = 0; i <= years; i++) {
      let formattedBalance = parseFloat(currentBalance).toFixed(2)
      values.push({
        name: i,
        pv: formattedBalance,
      })
      currentBalance = currentBalance * rate
    }

    setValues(values)
  }, [initialBalance, interestRate, years])

  return (
    <>
      <Layout location={location} title={siteTitle}>
        <Container>
          <h1>Compound Interest Calculator</h1>
          <br />
          <Row>
            <Col>
              <Row>
                <Col>Initial Balance:</Col>
                <Col>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    value={initialBalance}
                    onChange={e => {
                      setInitialBalance(
                        parseInt(e.target.value.replace(/\D/, ""))
                      )
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col>Interest Rate:</Col>
                <Col>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={e =>
                      setInterestRate(
                        parseInt(e.target.value.replace(/\D/, ""))
                      )
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col>Years:</Col>
                <Col>
                  <input
                    type="number"
                    value={years}
                    onChange={e =>
                      setYears(parseInt(e.target.value.replace(/\D/, "")))
                    }
                  />
                </Col>
              </Row>
            </Col>
            <Col>
              <label>Total: {total}</label>

              <BarChart
                width={400}
                height={300}
                data={values}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pv" stackId="a" fill="#8884d8" />
              </BarChart>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  )
}

export default Calculator

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
