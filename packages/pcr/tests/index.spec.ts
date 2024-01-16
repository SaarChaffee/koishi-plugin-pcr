import { assert, expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ChaiPluginAssertType as AssertType } from 'chai-asserttype-extra'
import { Context } from 'koishi'

import { PCR } from '../src/api'
import { ImageInfo as ImageInfoType } from '../src/types'
import { } from '../src/index'

class ImageInfo implements ImageInfoType {
  buffer: Buffer
  type: string
}

use(chaiAsPromised)
use(AssertType)

describe('pcr', () => {
  const app = new Context()
  app.plugin(PCR, { root: 'data/pcr' })

  before(() => app.start())
  after(() => app.stop())

  it('should parse team', async () => {
    const team = app.pcr.parseTeam('羊驼黄骑水电星法露娜')
    expect(team).is.instanceof(Array).and.to.have.lengthOf(5)
  })

  it('should parse team into id', async () => {
    const team = app.pcr.parseTeam('羊驼黄骑水电星法露娜', true)
    expect(team).is.instanceof(Array).and.to.have.lengthOf(5)
      .and.to.satisfy((team) => team.every((id) => id.match(/^\d{4}$/)))
  })

  it('should not parse team', async () => {
    const team = app.pcr.parseTeam('羊驼黄芪水电星法露娜')
    expect(team).is.an('array').and.to.have.lengthOf(2)
    assert.strictEqual(team[0], false)
    expect(team[1]).is.a('string').and.to.equal('黄芪')
  })

  it('should return a buffer of icon unit', async () => {
    expect(app.pcr.getUnitIcon('1009', 6)).to.eventually.be.an.instanceof(ImageInfo)
  })
})
