import serverless from 'serverless-http'
import { createApp } from '../server/app.js'

const app = createApp()

export const config = {
  maxDuration: 30,
}

export default serverless(app, {
  binary: false,
})
