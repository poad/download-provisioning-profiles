import {BundleIdsResponse} from './types'
import JwtGenerator from 'appstore-connect-jwt-generator-core'
import fetch from 'cross-fetch'

interface IClient {
  listBundleIds: (query?: {
    [key: string]: string
  }) => Promise<BundleIdsResponse>
  token: () => string
}

class Client implements IClient {
    jwt: string
    constructor(param: {
      privateKey: string | Buffer
      issuerId: string
      apiKeyId: string
      duration?: number
    }) {
      const { privateKey, issuerId, apiKeyId, duration } = param
      this.jwt = JwtGenerator.tokenSync(privateKey, issuerId, apiKeyId, duration)
    }

    listBundleIds = async (query?: {
      [key: string]: string
    }): Promise<BundleIdsResponse> => {
      const queryString = query
        ? Object.entries(query)
          .map(entry => `${entry[0]}=${encodeURIComponent(entry[1])}`)
          .reduce((acc: string, cur: string) => `${acc}&${cur}`)
        : ''

      const headers = {
        Authorization: `Bearer ${this.jwt}`
      }

      const uri = `https://api.appstoreconnect.apple.com/v1/bundleIds${queryString.length > 0 ? '?' : ''
        }${queryString}`

      const response = await fetch(uri, {
        headers
      })

      if (response.status !== 200) {
        const text = await response.text()
        console.error(text)
        throw new Error(text)
      }
      return response.json() as Promise<BundleIdsResponse>
    }

    token = () => this.jwt
  }


export default Client
