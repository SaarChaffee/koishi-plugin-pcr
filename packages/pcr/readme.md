<h1 align="center">PCR 插件核心</h1>

[![npm](https://img.shields.io/npm/v/koishi-plugin-pcr?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pcr)

## 配置项

### config.root

- 类型: `string`
- 默认值: `data/pcr`

存储图片资源文件的路径，相对于 koishi 的工作目录。

### config.LandosolRoster

- 类型: `string`
- 默认值: `Ghproxy 代理的 Github`

[兰德索尔花名册](https://github.com/Ice9Coffee/LandosolRoster)数据源，需要能直接访问到目录下的 `json` 文件。

## 类型定义

```ts
interface Result {
  [key: string]: string[]
}

interface Chara {
  [key: string]: string
}

interface CharacterProfile {
  名字: string
  公会: string
  生日: string
  年龄: string
  身高: string
  体重: string
  血型: string
  种族: string
  喜好: string
  声优: string
  ...
}

export interface CharacterProfiles {
  [key: string]: CharacterProfile
}

export interface ImageInfo {
  buffer: Buffer | Image
  type: string
}
```
实例方法

### pcr.getRoot()
- 返回值: `string`

获得当前插件的资源文件根目录，为 [ctx.baseDir](https://koishi.chat/zh-CN/api/core/context.html#ctx-basedir) 连接 [config.root](#configroot)。

### pcr.getImage(url, fullPath, canvas?)
- 参数:
  - `url: string` - 资源地址
  - `fullPath: string` - 存储资源的完整路径
  - `canvas?: boolean` - 是否返回 Canvas 的 Image 对象
- 返回值: `Promise<ImageInfo>`

获取图片资源。会首先尝试从本地获取，如果不存在则从 `url` 下载并保存到 `fullPath`。

### pcr.getCardProfile(id, star, canvas?)
- 参数:
  - `id: string` - 角色 ID
  - `star: string` - 角色星级，`1` 到 `6`
  - `canvas?: boolean` - 是否返回 Canvas 的 Image 对象
- 返回值: `Promise<ImageInfo>`

获取角色卡片图片。

### pcr.getUnitIcon(id, star, canvas?)
- 参数:
  - `id: string` - 角色 ID
  - `star: string` - 角色星级，`1` 到 `6`
  - `canvas?: boolean` - 是否返回 Canvas 的 Image 对象
- 返回值: `Promise<ImageInfo>`

获取角色头像图片。

### pcr.getCardFull(id, star, canvas?)
- 参数:
  - `id: string` - 角色 ID
  - `star: string` - 角色星级，`1` 到 `6`
  - `canvas?: boolean` - 是否返回 Canvas 的 Image 对象
- 返回值: `Promise<ImageInfo>`

获取角色全身完整图片。

### pcr.initCharaName(res?)
- 参数:
  - `res?: Result` - 角色名字及昵称，缺省则从 [兰德索尔花名册](#configlandosolroster) 获取

初始化角色名字及昵称。会将其存入字典树中以便使用。

### pcr.initCharaProfile(res?)
- 参数:
  - `res?: CharacterProfiles` - 角色资料，缺省则从 [兰德索尔花名册](#configlandosolroster) 获取

初始化角色资料。

### pcr.initUnavailableChara(res?)
- 参数:
  - `res?: number[]` - 未实装的角色的 ID 列表，缺省则从 [兰德索尔花名册](#configlandosolroster) 获取

初始化未实装的角色的 ID。

### pcr.getCharaProfile(id)
- 参数:
  - `id: string` - 角色 ID
- 返回值: `CharacterProfile`

获取角色资料。

### pcr.isUnavailableChara(id)
- 参数:
  - `id: string` - 角色 ID
- 返回值: `boolean`

判断角色是否未实装。

### pcr.parseTeam(str, toID?)
- 参数:
  - `str: string` - 队伍字符串
  - `toID?: boolean` - 是否转换为角色 ID
- 返回值: `string[] | [boolean, string]`

解析队伍字符串。解析成功则返回包含角色名的数组，如果 `toID` 为 `true`，则会将角色名称转换为角色 ID。如果遇到无法解析的角色，则会返回一个包含 `false` 和无法解析的角色名的数组。