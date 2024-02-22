import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ChaiPluginAssertType as AssertType } from 'chai-asserttype-extra'
import { Context } from 'koishi'

import { Arena } from '../src'
import { PcrdfansData, PcrdfansResponse } from '../src/types'

use(chaiAsPromised)
use(AssertType)

class Result implements PcrdfansResponse {
  code: number
  message: string
  data: PcrdfansData
  version: string
}

describe('arena', () => {
  const app = new Context()
  app.plugin(Arena, { API_KEY: 'lLnnsACR' })
  before(() => app.start())
  after(() => app.stop())

  describe('arena', () => {
    it('arena', async () => {
      const res = app.arena.request([105201, 103401, 110301, 113401, 111401])
      expect(res).to.eventually.be.instanceOf(Result)
        .and.have.property('code').which.to.be.equal(0)
      console.log(await res)
    })
  })
})
